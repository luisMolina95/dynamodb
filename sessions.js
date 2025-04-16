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

async function main() {
  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.ScanCommand({ TableName: "sessions" })
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
    AWSLibDynamoDB
    const algo = await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: "sessions",
        Item: {
          pk: crypto.randomUUID(),
          username: username.trim().toLowerCase(),
        },
      })
    );
    console.log(algo);
    location.reload();
  });
