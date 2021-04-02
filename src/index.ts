import inquirer from "inquirer";
import { data } from "./data/Task.data";
import { Commands } from "./enum/Commands.enum";
import { TaskCollection } from "./model/TaskCollection";

const collection = new TaskCollection("Revanchista", data);
let showComplete: boolean = false;

function displayTaskList(): void {
  console.log(
    `${collection.userName}'s (${collection.getTaskCounts().incomplete} to do)`
  );
  collection.getTaskItems(showComplete).forEach((task) => {
    task.printDetails();
  });
}

async function promptAdd(): Promise<void> {
  console.clear();
  const answer = await inquirer.prompt({
    type: "input",
    name: "add",
    message: "Enter Task: ",
  });
  if (answer["add"] != "") collection.addTask(answer["add"]);

  prompUser();
}

async function prompComplete(): Promise<void> {
  console.clear();
  const answers = await inquirer.prompt({
    type: "checkbox",
    name: "complete",
    message: "Mark Task Complete",
    choices: collection.getTaskItems(showComplete).map((item) => ({
      name: item.task,
      value: item.id,
      checked: item.complete,
    })),
  });
  let completedTasks = answers["complete"] as number[];
  collection
    .getTaskItems(true)
    .forEach((item) =>
      collection.markComplete(
        item.id,
        completedTasks.find((id) => id === item.id) != undefined
      )
    );
  prompUser();
}

function prompRemove(): void {
  collection.removeComplete();
  console.log("Remove Collection complete");
  prompUser();
}

async function prompUser(): Promise<void> {
  console.clear();
  displayTaskList();

  const answers = await inquirer.prompt({
    type: "list",
    name: "command",
    message: "Choose Option",
    choices: Object.values(Commands),
  });
  switch (answers["command"]) {
    case Commands.Toggle:
      showComplete = !showComplete;
      prompUser();
      break;

    case Commands.Add:
      promptAdd();
      break;

    case Commands.Complete:
      collection.getTaskCounts().incomplete > 0 ? prompComplete() : prompUser();
      break;

    case Commands.Purge:
      collection.getTaskCounts().complete > 0 ? prompRemove() : prompUser();
      break;

    case Commands.Quit:
      console.log("bye");
      break;
  }
}

prompUser();
