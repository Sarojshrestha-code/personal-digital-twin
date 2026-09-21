 require("dotenv").config();

const express = require("express");
const Groq = require("groq-sdk");

const Task = require("../models/tasks");
const Goal = require("../models/goal");
const ActivityLog = require("../models/ActivityLog");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// =====================================================
// AI BEHAVIORAL INSIGHTS
// =====================================================

router.post("/insights", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    // =================================================
    // GET USER DATA
    // =================================================

    const [tasks, goals, activities] = await Promise.all([
      Task.find({
        user: userId,
      }),

      Goal.find({
        user: userId,
      }),

      ActivityLog.find({
        user: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50),
    ]);


    // =================================================
    // TASK ANALYSIS
    // =================================================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;

    const highPriorityPendingTasks = tasks.filter(
      (task) =>
        task.status === "pending" &&
        task.priority === "high"
    ).length;

    const taskCompletionRate =
      totalTasks > 0
        ? Math.round(
            (completedTasks / totalTasks) * 100
          )
        : 0;


    // =================================================
    // DEADLINE ANALYSIS
    // =================================================

    const today = new Date();

    today.setHours(0, 0, 0, 0);


    // -------------------------------------------------
    // OVERDUE TASKS
    // -------------------------------------------------

    const overdueTasks = tasks.filter((task) => {
      if (
        !task.dueDate ||
        task.status === "completed"
      ) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today;
    });


    // -------------------------------------------------
    // UPCOMING TASKS
    // -------------------------------------------------

    const upcomingTasks = tasks.filter((task) => {
      if (
        !task.dueDate ||
        task.status === "completed"
      ) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today;
    });


    // =================================================
    // PENDING TASK DETAILS FOR AI
    // =================================================

    const pendingTaskDetails = tasks
      .filter(
        (task) =>
          task.status === "pending"
      )
      .map((task) => {

        const linkedGoal = task.goal
          ? goals.find(
              (goal) =>
                goal._id.toString() ===
                task.goal.toString()
            )
          : null;


        return {
          title: task.title,

          priority:
            task.priority || "medium",

          dueDate: task.dueDate
            ? new Date(task.dueDate)
                .toISOString()
                .split("T")[0]
            : "No due date",

          goal: linkedGoal
            ? linkedGoal.title
            : "No linked goal",
        };
      });


    // =================================================
    // GOAL ANALYSIS
    // =================================================

    const totalGoals = goals.length;

    const completedGoals = goals.filter(
      (goal) =>
        goal.status === "completed"
    ).length;

    const activeGoals = goals.filter(
      (goal) =>
        goal.status === "active"
    ).length;

    const goalCompletionRate =
      totalGoals > 0
        ? Math.round(
            (completedGoals / totalGoals) * 100
          )
        : 0;


    // =================================================
    // ACTIVITY ANALYSIS
    // =================================================

    const recentActivities =
      activities.length;

    const taskCreatedActivities =
      activities.filter(
        (activity) =>
          activity.type ===
          "task_created"
      ).length;

    const taskCompletedActivities =
      activities.filter(
        (activity) =>
          activity.type ===
          "task_completed"
      ).length;


    // =================================================
    // AI ANALYSIS
    // =================================================

    const completion =
      await groq.chat.completions.create({

        model:
          "openai/gpt-oss-20b",

        messages: [
          {
            role: "system",

            content: `
You are the Behavioral Analysis component of the user's Personal Digital Twin.

Your job is to interpret the user's actual productivity data and provide a short, useful behavioral insight.

IMPORTANT RULES:

1. Use ONLY the metrics and task/goal information provided below.
2. Never invent personal habits, schedules, preferences, or facts.
3. Do not claim to know why the user behaves a certain way.
4. Do not create specific study times or work schedules.
5. Do not make medical or psychological diagnoses.
6. Clearly distinguish between what the numbers show and recommendations.
7. Recommendations must be directly related to the provided metrics and actual tasks.
8. Do not recommend something that contradicts the data.
9. Use simple Markdown.
10. Do not use Markdown tables.
11. Use short headings.
12. Use bullet points for lists.
13. Keep the response concise.
14. Do not add an "AI Twin" heading.
15. Do not repeat every metric unnecessarily.
16. When recommending a task, use the actual task title provided in PENDING TASK DETAILS.
17. If a pending task is high priority, mention its actual title when relevant.
18. If a pending task is linked to a goal, mention the actual goal title when relevant.
19. Do not invent task names, deadlines, or goal relationships.
20. Do not recommend a task that is not present in the provided data.
21. If there are multiple pending tasks, consider priority and due date when explaining which task deserves attention.
22. If there are no pending tasks, do not recommend completing a task.
23. Do not invent a deadline if the task has no due date.

STRUCTURE YOUR RESPONSE LIKE THIS:

## What the numbers show

Briefly explain the most important pattern from the data.

## Strengths

- Mention 1–3 positive observations supported by the metrics.

## Areas to watch

- Mention the most relevant issue supported by the metrics.
- If there is no significant issue, say so.

## Suggested next steps

- Give 2–3 practical recommendations based ONLY on the provided data.
- When appropriate, mention the actual pending task title.
- When appropriate, mention the actual linked goal.

USER BEHAVIORAL DATA:

TASKS
- Total tasks: ${totalTasks}
- Completed tasks: ${completedTasks}
- Pending tasks: ${pendingTasks}
- High-priority pending tasks: ${highPriorityPendingTasks}
- Task completion rate: ${taskCompletionRate}%

DEADLINES
- Overdue tasks: ${overdueTasks.length}
- Upcoming pending tasks: ${upcomingTasks.length}

PENDING TASK DETAILS:
${
  pendingTaskDetails.length > 0
    ? pendingTaskDetails
        .map(
          (task) =>
            `- ${task.title} | Priority: ${task.priority} | Due Date: ${task.dueDate} | Goal: ${task.goal}`
        )
        .join("\n")
    : "No pending tasks."
}

GOALS
- Total goals: ${totalGoals}
- Active goals: ${activeGoals}
- Completed goals: ${completedGoals}
- Goal completion rate: ${goalCompletionRate}%

ACTIVITY
- Recent activities: ${recentActivities}
- Tasks created: ${taskCreatedActivities}
- Tasks completed: ${taskCompletedActivities}
`,
          },
        ],
      });


    // =================================================
    // GET AI RESPONSE
    // =================================================

    const insight =
      completion.choices[0]?.message?.content ||
      "Unable to generate behavioral insights.";


    // =================================================
    // RESPONSE
    // =================================================

    res.json({
      message:
        "AI behavioral insights generated successfully",

      insight,

      metrics: {
        tasks: {
          total: totalTasks,

          completed:
            completedTasks,

          pending:
            pendingTasks,

          highPriorityPending:
            highPriorityPendingTasks,

          completionRate:
            taskCompletionRate,
        },

        deadlines: {
          overdue:
            overdueTasks.length,

          upcoming:
            upcomingTasks.length,
        },

        goals: {
          total:
            totalGoals,

          active:
            activeGoals,

          completed:
            completedGoals,

          completionRate:
            goalCompletionRate,
        },

        activity: {
          recent:
            recentActivities,

          tasksCreated:
            taskCreatedActivities,

          tasksCompleted:
            taskCompletedActivities,
        },
      },
    });

  } catch (error) {

    console.error(
      "AI behavioral insight error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to generate AI behavioral insights",
    });
  }
});


// =====================================================
// BEHAVIORAL SUMMARY
// =====================================================

router.get(
  "/summary",
  authMiddleware,
  async (req, res) => {

    try {

      const userId = req.userId;


      // =================================================
      // GET USER DATA
      // =================================================

      const [tasks, goals, activities] =
        await Promise.all([

          Task.find({
            user: userId,
          }),

          Goal.find({
            user: userId,
          }),

          ActivityLog.find({
            user: userId,
          })
            .sort({
              createdAt: -1,
            })
            .limit(50),

        ]);


      // =================================================
      // TASK ANALYSIS
      // =================================================

      const totalTasks =
        tasks.length;

      const completedTasks =
        tasks.filter(
          (task) =>
            task.status === "completed"
        ).length;

      const pendingTasks =
        tasks.filter(
          (task) =>
            task.status === "pending"
        ).length;

      const highPriorityPendingTasks =
        tasks.filter(
          (task) =>
            task.status === "pending" &&
            task.priority === "high"
        ).length;

      const taskCompletionRate =
        totalTasks > 0
          ? Math.round(
              (completedTasks /
                totalTasks) *
                100
            )
          : 0;


      // =================================================
      // DATE ANALYSIS
      // =================================================

      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      // -------------------------------------------------
      // OVERDUE TASKS
      // -------------------------------------------------

      const overdueTasks =
        tasks.filter(
          (task) => {

            if (
              !task.dueDate ||
              task.status ===
                "completed"
            ) {
              return false;
            }

            const dueDate =
              new Date(
                task.dueDate
              );

            dueDate.setHours(
              0,
              0,
              0,
              0
            );

            return (
              dueDate <
              today
            );
          }
        );


      // -------------------------------------------------
      // UPCOMING TASKS
      // -------------------------------------------------

      const upcomingTasks =
        tasks.filter(
          (task) => {

            if (
              !task.dueDate ||
              task.status ===
                "completed"
            ) {
              return false;
            }

            const dueDate =
              new Date(
                task.dueDate
              );

            dueDate.setHours(
              0,
              0,
              0,
              0
            );

            return (
              dueDate >=
              today
            );
          }
        );


      // =================================================
      // GOAL ANALYSIS
      // =================================================

      const totalGoals =
        goals.length;

      const activeGoals =
        goals.filter(
          (goal) =>
            goal.status ===
            "active"
        ).length;

      const completedGoals =
        goals.filter(
          (goal) =>
            goal.status ===
            "completed"
        ).length;

      const goalCompletionRate =
        totalGoals > 0
          ? Math.round(
              (completedGoals /
                totalGoals) *
                100
            )
          : 0;


      // =================================================
      // ACTIVITY ANALYSIS
      // =================================================

      const recentActivities =
        activities.length;

      const taskCreatedActivities =
        activities.filter(
          (activity) =>
            activity.type ===
            "task_created"
        ).length;

      const taskCompletedActivities =
        activities.filter(
          (activity) =>
            activity.type ===
            "task_completed"
        ).length;


      // =================================================
      // BEHAVIORAL STATUS
      // =================================================

      let taskPerformance =
        "No data";

      if (
        taskCompletionRate >=
        80
      ) {

        taskPerformance =
          "Excellent";

      } else if (
        taskCompletionRate >=
        60
      ) {

        taskPerformance =
          "Good";

      } else if (
        taskCompletionRate >=
        40
      ) {

        taskPerformance =
          "Needs Improvement";

      } else if (
        totalTasks > 0
      ) {

        taskPerformance =
          "Low";
      }


      let goalProgress =
        "No data";

      if (
        goalCompletionRate >=
        80
      ) {

        goalProgress =
          "Excellent";

      } else if (
        goalCompletionRate >=
        60
      ) {

        goalProgress =
          "Good";

      } else if (
        goalCompletionRate >=
        40
      ) {

        goalProgress =
          "Moderate";

      } else if (
        totalGoals > 0
      ) {

        goalProgress =
          "Low";
      }


      // =================================================
      // RESPONSE
      // =================================================

      res.json({

        message:
          "Behavioral analysis generated successfully",

        analysis: {

          tasks: {

            total:
              totalTasks,

            completed:
              completedTasks,

            pending:
              pendingTasks,

            highPriorityPending:
              highPriorityPendingTasks,

            completionRate:
              taskCompletionRate,

            performance:
              taskPerformance,
          },


          deadlines: {

            overdueTasks:
              overdueTasks.length,

            upcomingTasks:
              upcomingTasks.length,
          },


          goals: {

            total:
              totalGoals,

            active:
              activeGoals,

            completed:
              completedGoals,

            completionRate:
              goalCompletionRate,

            progress:
              goalProgress,
          },


          activity: {

            recentActivities,

            tasksCreated:
              taskCreatedActivities,

            tasksCompleted:
              taskCompletedActivities,
          },

        },
      });

    } catch (error) {

      console.error(
        "Behavior analysis error:",
        error
      );

      res.status(500).json({

        message:
          "Failed to generate behavioral analysis",

      });
    }
  }
);


module.exports = router;