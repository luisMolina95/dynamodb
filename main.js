const dynamodb = new AWSDynamoDB.DynamoDBClient({
  credentials: {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey",
  },
  endpoint: "https://renderdynamodb.onrender.com",
  region: "fakeRegion",
});

function cellToHTML(obj) {
 return Object.entries(obj)
    .map(
      ([key, value]) =>
        `<b>${key}:</b> ${
          typeof value === "object" ? `${JSON.stringify(value, null, 2)}` : value
        }`
    )
    .join(",<br>");
}

async function main() {

  const comRes = await dynamodb.send(new AWSDynamoDB.ListTablesCommand());
  console.log(comRes.TableNames);
  const table = document.getElementById("tableList");

  comRes.TableNames.forEach(async (TableName) => {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.innerHTML = `<a href="sessions.html?tableName=${TableName}"><b>${TableName}</b></a>`;

    const cell2 = row.insertCell(1);
    const res3 = await dynamodb.send(
      new AWSDynamoDB.DescribeTableCommand({
        TableName,
      })
    );
    cell2.innerHTML = cellToHTML(res3.Table);

    const cell3 = row.insertCell(2);
    const res4 = await dynamodb.send(
      new AWSDynamoDB.DescribeTimeToLiveCommand({
        TableName,
      })
    );
    cell3.innerHTML = cellToHTML(res4.TimeToLiveDescription);
  });
}
main();
