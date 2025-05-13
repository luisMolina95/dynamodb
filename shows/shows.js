function cellToHTML(obj) {
  return Object.entries(obj)
    .map(([key, value]) =>
      key === "PK"
        ? `<b>${key}:</b> <a href="./admin.html?id=${encodeURIComponent(
            value
          )}">${value}</a>`
        : `<b>${key}:</b> ${
            typeof value === "object"
              ? `${JSON.stringify(value, null, 2)}`
              : value
          }`
    )
    .join(",<br>");
}

async function main() {
  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "#PK = :PK",
      ExpressionAttributeNames: {
        "#PK": "GSI1PK",
      },
      ExpressionAttributeValues: {
        ":PK": "SHOW",
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
  .getElementById("createShow")
  .addEventListener("submit", async function (event) {
    /** @type {string} */
    const showTitle = document.getElementById("title").value;
    const currentDate = new Date();
    const showID = `SHOW#${crypto.randomUUID()}`;
    await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: showID,
          SK: showID,
          GSI1PK: "SHOW",
          GSI1SK: `SHOW#${showTitle.trim().replace(/\s+/g, "_").toUpperCase()}`,
          title: showTitle.trim().toLowerCase(),
          createdAt: currentDate.toISOString(),
          id: showID,
        },
      })
    );
  });
