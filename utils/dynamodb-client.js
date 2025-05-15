const dynamodb = new AWSDynamoDB.DynamoDBClient({
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
  endpoint: "http://localhost:9090", //https://dynamodb.us-east-1.amazonaws.com
  region: "fakeRegion", //xx-xxxx-x
});

const ddbDocClient = AWSLibDynamoDB.DynamoDBDocumentClient.from(dynamodb);

const TABLE_NAME = "VideoSharingTable";
