const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function main() {
  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: id, SK: id },
    })
  );

  const episodeItem = comRes.Item;

  const table = document.getElementById("table");
  const row = table.insertRow();
  const cellId = row.insertCell(0);
  cellId.innerHTML = episodeItem.PK;

  const cellShowId = row.insertCell(1);
  cellShowId.innerHTML = episodeItem.showId;

  const cellTitle = row.insertCell(2);
  cellTitle.innerHTML = `<input type="text" id="title" value="${episodeItem.title}" />`;

  const queryComRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "#PK = :PK",
      ExpressionAttributeNames: {
        "#PK": "GSI1PK",
      },
      ExpressionAttributeValues: {
        ":PK": id,
      },
      ScanIndexForward: false,
    })
  );

  const episodesTable = document.getElementById("episodesTable");

  queryComRes.Items.forEach(async (item) => {
    const row = episodesTable.insertRow();
    const cell = row.insertCell(0);
    cell.innerHTML = cellToHTML(item);
  });
}
main();

document.getElementById("save").addEventListener("click", async function () {
  const newTitle = document.getElementById("title").value;

  await ddbDocClient.send(
    new AWSLibDynamoDB.UpdateCommand({
      TableName: TABLE_NAME,
      Key: { PK: id, SK: id },
      UpdateExpression: "SET #title = :value,#updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#title": "title",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":value": newTitle,":updatedAt": new Date().toISOString(),
      },
    })
  );
});

document
  .getElementById("generateClips")
  .addEventListener("submit", async function () {
    /** @type {string} */
    const episodeTitle = document.getElementById("episodeTitle").value;
    const currentDate = new Date();
    const episodeID = `EPISODE#${crypto.randomUUID()}`;
    await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: episodeID,
          SK: episodeID,
          GSI1PK: id,
          GSI1SK: `EPISODE#${currentDate.toISOString()}`,
          title: episodeTitle.trim().toLowerCase(),
          createdAt: currentDate.toISOString(),
        },
      })
    );
  });
