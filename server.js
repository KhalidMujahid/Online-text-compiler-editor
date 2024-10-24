const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "./client/dist")));

app.get("/",(req,res) => res.sendFile(path.join(__dirname, "./client/dist/", "index.html")));


const functionExec = (code, language) => {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    let tempFile;
    let command;

    if (language === "JavaScript") {
      tempFile = path.join(tempDir, "newfile.js");
      command = `node ${tempFile}`;
    } else if (language === 'Python') {
      tempFile = path.join(tempDir, "newfile.py");
      command = `python3 ${tempFile}`;
    } else if (language === "C++") {
      tempFile = path.join(tempDir, "newfile.cpp");
      const execFile = path.join(tempDir, "newfile");
      
      fs.writeFile(tempFile, code, (err) => {
        if (err) return reject(err);
        exec(`g++ ${tempFile} -o ${execFile}`, (compileError) => {
          if (compileError) {
            fs.unlink(tempFile, () => {});
            return reject(compileError.stderr || compileError.message);
          }
          command = execFile;
          executeCommand(command, tempFile, resolve, reject);
        });
      });
    } else {
      return reject("Unsupported language");
    }

    fs.writeFile(tempFile, code, (err) => {
      if (err) return reject(err);
      executeCommand(command, tempFile, resolve, reject);
    });
  });
};

const executeCommand = (command, tempFile, resolve, reject) => {
  exec(command, (error, stdout, stderr) => {
    fs.unlink(tempFile, (unlinkErr) => {
      if (unlinkErr) console.error("Error while deleting temp file");
    });
    if (error) {
      return reject(stderr || error.message);
    }
    resolve(stdout);
  });
};


app.post("/compile", async (req, res) => {
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({ message: "Code and language are required" });
  }

  try {
    const output = await functionExec(code, language);
    res.json({ output });
  } catch (err) {
    res.status(500).json({ message: "Error while compiling" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on :${PORT}`);
});

