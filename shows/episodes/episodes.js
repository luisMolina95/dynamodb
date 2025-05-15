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
const id = urlParams.get("id");
const exclusiveStartKey = urlParams.get("exclusiveStartKey");
const prevExclusiveStartKey = urlParams.get("prevExclusiveStartKey");
let showId = null;

async function main() {
  const episodeId = document.getElementById("episodeId");
  episodeId.value = id;

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
  showId = episodeItem.showId;

  const cellTitle = row.insertCell(2);
  cellTitle.innerHTML = `<input type="text" id="title" value="${episodeItem.title}" />`;
  const queryClipsComRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "GSI2",
      KeyConditionExpression: "#PK = :PK",
      ExpressionAttributeNames: {
        "#PK": "GSI2PK",
        "#id": "id",
      },
      ExpressionAttributeValues: {
        ":PK": id,
      },
      ScanIndexForward: false,
      ProjectionExpression: "#id,createdAt",
      Limit: 3,
      ExclusiveStartKey:
        exclusiveStartKey && exclusiveStartKey !== "null"
          ? JSON.parse(exclusiveStartKey)
          : undefined,
    })
  );

  const backPage = document.getElementById("backPage");
  if (exclusiveStartKey) {
    backPage.href = `?id=${encodeURIComponent(
      id
    )}&exclusiveStartKey=${encodeURIComponent(prevExclusiveStartKey)}`;
  } else {
    backPage.href = "";
  }

  const nextPage = document.getElementById("nextPage");

  if (queryClipsComRes.LastEvaluatedKey) {
    nextPage.href = `?id=${encodeURIComponent(
      id
    )}&exclusiveStartKey=${encodeURIComponent(
      JSON.stringify(queryClipsComRes.LastEvaluatedKey)
    )}&prevExclusiveStartKey=${encodeURIComponent(exclusiveStartKey)}`;
  } else {
    nextPage.href = "";
  }

  console.log(queryClipsComRes);
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
      UpdateExpression: "SET #title = :value,#updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#title": "title",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":value": newTitle,
        ":updatedAt": new Date().toISOString(),
      },
    })
  );
});

document
  .getElementById("generateClip")
  .addEventListener("submit", async function () {
    const currentDate = new Date();
    const clipID = `CLIP#${crypto.randomUUID()}`;
    await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: clipID,
          SK: clipID,
          GSI1PK: showId,
          GSI1SK: `CLIP#${currentDate.toISOString()}`,
          GSI2PK: id,
          GSI2SK: `CLIP#${currentDate.toISOString()}`,
          data: "Random clip",
          createdAt: currentDate.toISOString(),
          id: clipID,
          showId: showId,
          episodeId: id,
        },
      })
    );
  });
