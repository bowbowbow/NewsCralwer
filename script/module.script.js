const express = require('express');
const http = require('http');
const app = express();
const exec = require('child_process').exec;

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      resolve(stdout);
      if (error) {
        reject(error);
      }
    });
  });
}

const audioFileDirectory = './';

// example: http://localhost:8080/run?filenames[]=my_audio1.mp3&filenames[]=my_audio2.mp3
app.get('/run', async (req, res) => {
  const filenames = req.query.filenames;

  for (let i = 0; i < filenames.length; i++) {
    const audioFilePath = `${audioFileDirectory}/${filenames[i]}`;
    const aOutput = await run(`./a.py --audio_path=${audioFilePath}`);
    const bOutput = await run(`./b.py --input_path=${aOutput}`);
    const cOutput = await run(`./c.py --input_path=${bOutput}`);
    // cOutput을 DB에 저장
  }

  res.send('success msg');
});

const httpServer = http.createServer(app);
httpServer.listen(8080);
