import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'
import { awsCredentialsProvider } from '@vercel/functions/oidc'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { User } from './auth-types'

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!
const PK = process.env.DYNAMODB_TABLE_PARTITION_KEY || 'id'

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
  // Use a GSI scan with filter — for a real app you'd add a GSI on email
  // Here we use a FilterExpression on Scan via Query on the email-index GSI
  // Since we only have a single table, we'll store a lookup record keyed by email
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { [PK]: `email#${email.toLowerCase()}` },
    }),
  )
  if (!result.Item) return null
  const userId = result.Item.userId as string
  return getUserById(userId)
}

export async function getUserById(id: string): Promise<User | null> {
  const docClient = getDocClient()
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { [PK]: `user#${id}` },
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

  // Store the user record
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: { [PK]: `user#${id}`, ...user },
      ConditionExpression: 'attribute_not_exists(#pk)',
      ExpressionAttributeNames: { '#pk': PK },
    }),
  )

  // Store the email → userId lookup
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        [PK]: `email#${email.toLowerCase()}`,
        userId: id,
        createdAt: now,
      },
      ConditionExpression: 'attribute_not_exists(#pk)',
      ExpressionAttributeNames: { '#pk': PK },
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
