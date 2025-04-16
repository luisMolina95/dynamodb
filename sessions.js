const DAYS_7 = 7 * 24 * 60 * 60 * 1000;
const dynamodb = new AWSDynamoDB.DynamoDBClient({
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
  endpoint: "http://localhost:9090",
  region: "fakeRegion",
});

const ddbDocClient = AWSLibDynamoDB.DynamoDBDocument.from(dynamodb);

function cellToHTML(obj) {
  return Object.entries(obj)
    .map(
      ([key, value]) =>
        `<b>${key}:</b> ${
          typeof value === "object"
            ? `${JSON.stringify(value, null, 2)}`
            : value
        }`
    )
    .join(",<br>");
}
const urlParams = new URLSearchParams(window.location.search);
const tableName =urlParams.get("tableName")|| "sessions";
async function main() {
  console.log(urlParams.get("tableName"));
  const currentDate = new Date(); // or any specific date
  console.log(Math.floor(currentDate.getTime() / 1000));
  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.ScanCommand({
      TableName: tableName,
      FilterExpression: "#ttl > :epoch",
      ExpressionAttributeNames: { "#ttl": "ttl" },
      ExpressionAttributeValues: {
        ":epoch": Math.floor(currentDate.getTime() / 1000),
      },
    })
  );
  console.log(comRes);
  const table = document.getElementById("table");

  comRes.Items.forEach(async (item) => {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.innerHTML = cellToHTML(item);
  });
}

main();

document
  .getElementById("inputSession")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents form from actually submitting
    /** @type {string} */
    const username = document.getElementById("username").value;
    console.log(username);
    const currentDate = new Date(); // or any specific date
    const expirationDate = new Date(currentDate.getTime() + DAYS_7);
    const algo = await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: tableName,
        Item: {
          pk: crypto.randomUUID(),
          username: username.trim().toLowerCase(),
          createdAt: currentDate.toISOString(),
          expiresAt: expirationDate.toISOString(),
          ttl: Math.floor(expirationDate.getTime() / 1000),
        },
      })
    );
    console.log(algo);
    location.reload();
  });
