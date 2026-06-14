import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import type { User } from './auth-types'

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!

// The table uses a composite key: PK (hash) + SK (range)
const HASH_KEY = 'PK'
const SORT_KEY = 'SK'

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

export async function getUserByEmail(email: string): Promise<User | null> {
  const docClient = getDocClient()
  // Email lookup record: PK=EMAIL#<email>, SK=LOOKUP
  const lookup = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        [HASH_KEY]: `EMAIL#${email.toLowerCase()}`,
        [SORT_KEY]: 'LOOKUP',
      },
    }),
  )
  if (!lookup.Item) return null
  return getUserById(lookup.Item.userId as string)
}

export async function getUserById(id: string): Promise<User | null> {
  const docClient = getDocClient()
  // User record: PK=USER#<id>, SK=PROFILE
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        [HASH_KEY]: `USER#${id}`,
        [SORT_KEY]: 'PROFILE',
      },
    }),
  )
  return result.Item ? (result.Item as User) : null
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

  // Write both records atomically so email lookup is always consistent
  await docClient.send(
    new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              [HASH_KEY]: `USER#${id}`,
              [SORT_KEY]: 'PROFILE',
              ...user,
            },
            ConditionExpression:
              'attribute_not_exists(#pk)',
            ExpressionAttributeNames: { '#pk': HASH_KEY },
          },
        },
        {
          Put: {
            TableName: TABLE_NAME,
            Item: {
              [HASH_KEY]: `EMAIL#${email.toLowerCase()}`,
              [SORT_KEY]: 'LOOKUP',
              userId: id,
              createdAt: now,
            },
            ConditionExpression:
              'attribute_not_exists(#pk)',
            ExpressionAttributeNames: { '#pk': HASH_KEY },
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
