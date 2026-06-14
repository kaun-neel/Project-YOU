import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { User } from './auth-types'

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!

function getDocClient() {
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_REGION },
    }),
  })
  return DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
  })
}

// PK=USER#<id>   SK=PROFILE  → holds the full user record
// PK=EMAIL#<email>  SK=LOOKUP → holds only userId for fast email→id lookup

export async function getUserByEmail(email: string): Promise<User | null> {
  const docClient = getDocClient()
  const lookupResult = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `EMAIL#${email.toLowerCase()}`,
        SK: 'LOOKUP',
      },
    }),
  )
  if (!lookupResult.Item) return null
  return getUserById(lookupResult.Item.userId as string)
}

export async function getUserById(id: string): Promise<User | null> {
  const docClient = getDocClient()
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${id}`,
        SK: 'PROFILE',
      },
    }),
  )
  if (!result.Item) return null
  // Strip DynamoDB keys before returning
  const { PK, SK, ...rest } = result.Item
  return rest as User
}

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<User> {
  const docClient = getDocClient()
  const id = nanoid()
  const passwordHash = await bcrypt.hash(password, 12)
  const now = Date.now()

  const user: User = {
    id,
    email: email.toLowerCase(),
    name,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  }

  // Write both records atomically
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `USER#${id}`,
              SK: 'PROFILE',
              ...user,
            },
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: `EMAIL#${email.toLowerCase()}`,
              SK: 'LOOKUP',
              userId: id,
              createdAt: now,
            },
            ConditionExpression: 'attribute_not_exists(PK)',
          },
        },
      ],
    }),
  )

  return user
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
