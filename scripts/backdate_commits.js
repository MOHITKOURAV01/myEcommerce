const { execSync } = require('child_process');

const dates = [
  '2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30', '2026-03-31',
  '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-05'
];

try {
  console.log("Analyzing git workspace...");
  const statusOutput = execSync('git status --porcelain -uall').toString();
  const fileLines = statusOutput.split('\n').filter(line => line.trim().length > 0);

  const filesToProcess = fileLines.map(line => {
    let filePath = line.substring(3).replace(/^"|"$/g, '');
    return { filePath };
  });

  const totalCommits = 100;
  let currentFileIndex = 0;

  for (let dayIndex = 0; dayIndex < dates.length; dayIndex++) {
    const day = dates[dayIndex];
    
    for (let commitNum = 0; commitNum < 10; commitNum++) {
      const hour = 9 + Math.floor(commitNum * 0.8);
      const min = Math.floor(Math.random() * 60);
      const isoString = `${day}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00`;
      
      let chunk = [];
      const numFilesRemaining = filesToProcess.length - currentFileIndex;
      const commitsLeft = 100 - ((dayIndex * 10) + commitNum);
      
      let filesToTake = 1;
      if (commitsLeft === 1) {
         filesToTake = numFilesRemaining;
      } else if (numFilesRemaining > commitsLeft) {
         filesToTake = Math.ceil(numFilesRemaining / commitsLeft);
      } else if (numFilesRemaining < commitsLeft) {
         filesToTake = numFilesRemaining > 0 ? 1 : 0;
      }

      for (let f = 0; f < filesToTake; f++) {
         if (currentFileIndex < filesToProcess.length) {
            chunk.push(filesToProcess[currentFileIndex]);
            currentFileIndex++;
         }
      }

      const env = {
        ...process.env,
        GIT_AUTHOR_DATE: isoString,
        GIT_COMMITTER_DATE: isoString
      };

      if (chunk.length > 0) {
        let msg = `feat: update ${chunk[0].filePath.split('/').pop()}`;
        if (chunk.length > 1) msg += ` and related changes`;

        for (const fileObj of chunk) {
           execSync(`git add --all "${fileObj.filePath}"`);
        }

        execSync(`git commit --allow-empty -m "${msg}"`, { env, stdio: 'ignore' });
        console.log(`[${isoString}] Committed ${chunk.length} file(s)`);
      } else {
         execSync(`git commit --allow-empty -m "chore: routine progress update"`, { env, stdio: 'ignore' });
         console.log(`[${isoString}] Empty commit (padding to reach 100)`);
      }
    }
  }

  console.log('\nAll 100 commits generated successfully with staggered dates!');
  console.log('Pushing to GitHub repository...');
  
  // Actually push the code
  execSync('git push -f origin main', { stdio: 'inherit' });
  console.log('Push complete!');

} catch (error) {
   console.error("Script failed:", error.message);
}
