const express = require("express");
const { Todo } = require("../../models");
const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

// toutes les routes ici nécessitent un token
router.use(requireAuth);

// petite validation
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function parseDueDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

// GET /todos?page=1&limit=10&status=all|done|todo
router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "10", 10)));
    const offset = (page - 1) * limit;

    const status = (req.query.status || "all").toLowerCase();
    const where = { userId };
    if (status === "done") where.done = true;
    if (status === "todo") where.done = false;

    const { rows, count } = await Todo.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "done", "dueDate", "createdAt", "updatedAt"]
    });

    res.json({
      items: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "internal error" });
  }
});

// POST /todos  { title, dueDate? }
router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, dueDate } = req.body || {};

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "title is required" });
    }

    const due = parseDueDate(dueDate);
    if (dueDate && !due) {
      return res.status(400).json({ message: "invalid dueDate (use ISO format)" });
    }

    const todo = await Todo.create({
      title: title.trim(),
      dueDate: due,
      userId
    });

    res.status(201).json({
      id: todo.id,
      title: todo.title,
      done: todo.done,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "internal error" });
  }
});

// PATCH /todos/:id  { title?, done?, dueDate? }
router.patch("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "invalid id" });

    const todo = await Todo.findOne({ where: { id, userId } });
    if (!todo) return res.status(404).json({ message: "todo not found" });

    const { title, done, dueDate } = req.body || {};
    if (title !== undefined) {
      if (!isNonEmptyString(title)) return res.status(400).json({ message: "invalid title" });
      todo.title = title.trim();
    }
    if (done !== undefined) {
      if (typeof done !== "boolean") return res.status(400).json({ message: "invalid done" });
      todo.done = done;
    }
    if (dueDate !== undefined) {
      const due = parseDueDate(dueDate);
      if (dueDate && !due) return res.status(400).json({ message: "invalid dueDate" });
      todo.dueDate = due;
    }

    await todo.save();
    res.json({
      id: todo.id,
      title: todo.title,
      done: todo.done,
      dueDate: todo.dueDate,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "internal error" });
  }
});

// DELETE /todos/:id
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "invalid id" });

    const deleted = await Todo.destroy({ where: { id, userId } });
    if (!deleted) return res.status(404).json({ message: "todo not found" });

    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "internal error" });
  }
});

module.exports = router;
