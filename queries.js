const DAYS_7 = 7 * 24 * 60 * 60 * 1000;

let sessions = [];

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
const tableName = urlParams.get("tableName") || "sessions";
async function main(username) {
  console.log(urlParams.get("tableName"));
  const currentDate = new Date(); // or any specific date
  console.log(Math.floor(currentDate.getTime() / 1000));
  const comRes = await ddbDocClient.send(
    new AWSLibDynamoDB.QueryCommand({
      TableName: "sessions",
      IndexName: "GSI1",
      KeyConditionExpression: "#username = :username",
      // FilterExpression: "#ttl > :epoch",
      ExpressionAttributeNames: { "#username": "username" /*"#ttl": "ttl"*/ },
      ExpressionAttributeValues: {
        ":username": username,
        // ":epoch": Math.floor(currentDate.getTime() / 1000),
      },
    })
  );
  console.log(comRes, {
    TableName: "sessions",
    KeyConditionExpression: "#pk = :pk",
    FilterExpression: "#ttl > :epoch",
    ExpressionAttributeNames: { "#pk": "pk", "#ttl": "ttl" },
    ExpressionAttributeValues: {
      ":pk": "1ffe2abf-c85e-49d0-b654-32bc99353361X",
      ":epoch": Math.floor(currentDate.getTime() / 1000),
    },
  });
  const table = document.getElementById("table");
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  sessions = comRes.Items;

  comRes.Items.forEach(async (item) => {
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.id = item.pk;
    cell.innerHTML = cellToHTML(item);
  });
}

document
  .getElementById("inputSession")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents form from actually submitting
    /** @type {string} */
    const username = document.getElementById("username").value;
    console.log(username);
    main(username);
  });

document
  .getElementById("inputSession")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevents form from actually submitting
    /** @type {string} */
    const username = document.getElementById("username").value;
    console.log(username);
    main(username);
  });

document
  .getElementById("deleteButton")
  .addEventListener("click", async function (event) {
    promises = sessions.map(({ pk }) =>
      ddbDocClient.send(
        new AWSLibDynamoDB.DeleteCommand({ TableName: "sessions", Key: { pk } })
      )
    );

    Promise.allSettled(promises).then(console.log("Done"));
  });
