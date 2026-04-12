const express = require("express");
const AWS = require("aws-sdk");
const serverless = require("serverless-http"); // Required for Lambda

const app = express();
app.use(express.json());

// Configure AWS
AWS.config.update({ region: "ap-south-1" });

// DynamoDB connection
const dynamo = new AWS.DynamoDB.DocumentClient();
const TABLE = "Habits";

// ✅ GET all habits
app.get("/habits", async (req, res) => {
  try {
    const data = await dynamo.scan({ TableName: TABLE }).promise();
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD new habit
app.post("/habits", async (req, res) => {
  try {
    const { name } = req.body;

    const params = {
      TableName: TABLE,
      Item: {
        id: Date.now().toString(),
        name,
        completed: false
      }
    };

    await dynamo.put(params).promise();
    res.json({ message: "Habit added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE (toggle completed)
app.put("/habits/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await dynamo.update({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: "SET completed = NOT completed"
    }).promise();

    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE habit
app.delete("/habits/:id", async (req, res) => {
  try {
    await dynamo.delete({
      TableName: TABLE,
      Key: { id: req.params.id }
    }).promise();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lambda handler (IMPORTANT)
module.exports.handler = serverless(app);

// ✅ Local testing (optional)
if (process.env.LOCAL) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}