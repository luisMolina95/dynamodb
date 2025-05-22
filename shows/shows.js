const subscribe = async (showId, status) => {
  const res = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
      ExpressionAttributeNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      ExpressionAttributeValues: {
        ":PK": "USER#USER_ID",
        ":SK": `SUBSCRIPTION#${showId}`,
      },
    })
  );

  console.log(res);
  const subItem = res?.Items?.[0];

  if (status) {
    if (subItem) {
      await ddbDocClient.send(
        new AWSLibDynamoDB.DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: "USER#USER_ID",
            SK: subItem.SK,
          },
        })
      );
    }
  } else {
    if (subItem) {
      await ddbDocClient.send(
        new AWSLibDynamoDB.DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: "USER#USER_ID",
            SK: subItem.SK,
          },
        })
      );
    }
    await ddbDocClient.send(
      new AWSLibDynamoDB.PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: "USER#USER_ID",
          SK: `SUBSCRIPTION#${showId}#${new Date().toISOString()}`,
          showId,
        },
      })
    );
  }

  location.reload();
};

function cellToHTML(obj) {
  return Object.entries(obj)
    .map(([key, value]) =>
      key === "id"
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
      ProjectionExpression: "createdAt,title,id",
    })
  );
  console.log(comRes);
  const table = document.getElementById("table");

  comRes.Items.forEach(async (item) => {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.innerHTML = cellToHTML(item);
    const subCell = row.insertCell(1);
    const resSub = await ddbDocClient.send(
      new AWSLibDynamoDB.QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
        ExpressionAttributeNames: {
          "#PK": "PK",
          "#SK": "SK",
        },
        ExpressionAttributeValues: {
          ":PK": "USER#USER_ID",
          ":SK": `SUBSCRIPTION#${item.id}`,
        },
      })
    );
    const subItem = resSub?.Items?.[0];
    subCell.innerHTML = `<button onclick="subscribe('${item.id}', ${
      subItem ? "true" : "false"
    })">${subItem ? "Unsubscribe" : "Subscribe"}</button>`;
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
