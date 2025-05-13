function cellToHTML(obj) {
  return Object.entries(obj)
    .map(([key, value]) =>
      key === "PK"
        ? `<b>${key}:</b> <a href="./episodes/?id=${encodeURIComponent(
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
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

async function main() {
  const episodeFormShowId = document.getElementById("episodeShowId");
  episodeFormShowId.value = id;

  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: id, SK: id },
    })
  );

  const showItem = comRes.Item;

  const table = document.getElementById("table");
  const row = table.insertRow();
  const cellId = row.insertCell(0);
  cellId.innerHTML = showItem.PK;

  const cellTitle = row.insertCell(1);
  cellTitle.innerHTML = `<input type="text" id="title" value="${showItem.title}" />`;

  const queryComRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "GSI1PK",
        "#SK": "GSI1SK",
      },
      ExpressionAttributeValues: {
        ":PK": id,
        ":SK": "EPISODE",
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

  const queryClipsComRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI1",
      KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "GSI1PK",
        "#SK": "GSI1SK",
      },
      ExpressionAttributeValues: {
        ":PK": id,
        ":SK": "CLIP",
      },
      ScanIndexForward: false,
    })
  );

  const clipsTable = document.getElementById("clipsTable");
  queryClipsComRes.Items.forEach(async (item) => {
    const row = clipsTable.insertRow();
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
      UpdateExpression:
        "SET #title = :value,#updatedAt = :updatedAt,#GSI1SK = :GSI1SK",
      ExpressionAttributeNames: {
        "#title": "title",
        "#updatedAt": "updatedAt",
        "#GSI1SK": "GSI1SK",
      },
      ExpressionAttributeValues: {
        ":value": newTitle,
        ":updatedAt": new Date().toISOString(),
        ":GSI1SK": `SHOW#${newTitle
          .trim()
          .replace(/\s+/g, "_")
          .toUpperCase()}`,
      },
    })
  );
});

document
  .getElementById("createEpisode")
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
          id: episodeID,
          showId: id,
        },
      })
    );
  });
