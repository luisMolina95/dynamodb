const urlParams = new URLSearchParams(window.location.search);
const showId = urlParams.get("showId");

async function updateClipsTable(showId) {
  console.log(showId);
  window.location.href = `?showId=${encodeURIComponent(showId)}`;
}

async function main() {
  const { Items } = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      ExpressionAttributeValues: {
        ":PK": "USER#USER_ID",
        ":SK": `SUBSCRIPTION`,
      },
    })
  );
  const table = document.getElementById("table");
  const row = table.insertRow();

  Items.forEach(async (element) => {
    const cell = row.insertCell();
    const { Item: show } = await ddbDocClient.send(
      new AWSLibDynamoDB.GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: element.showId, SK: element.showId },
      })
    );
    cell.innerHTML = `<button onclick="updateClipsTable('${element.showId}')">${show.title}</button>`;
  });

  if (showId) {
    const clipsTable = document.getElementById("clipsTable");
    const { Items } = await ddbDocClient.send(
      new AWSLibDynamoDB.QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
        ExpressionAttributeNames: {
          "#PK": "GSI1PK",
          "#SK": "GSI1SK",
        },
        ExpressionAttributeValues: {
          ":PK": showId,
          ":SK": "CLIP",
        },
        ScanIndexForward: false,
      })
    );
    Items.forEach((item) => {
      const clipRow = clipsTable.insertRow();
      const clipCell = clipRow.insertCell();
      clipCell.innerHTML = `<b>${item.id}</b> | ${item.createdAt}`;
    });
  }
}

main();
