const dynamodb = new AWSDynamoDB.DynamoDBClient({
  credentials: {

  },
  endpoint: "https://dynamodb.us-east-1.amazonaws.com", //http://localhost:9090
  region: "us-east-1",
});

const ddbDocClient = AWSLibDynamoDB.DynamoDBDocument.from(dynamodb);


const TABLE_NAME = "VideoSharingTable";
