import express from 'express';

const app = express();
let hitCount = 0;

app.post('/api/attack-surface', (req, res) => {
    hitCount++;
    if (hitCount % 500 === 0) {
        console.log(`💥 SHIELDS HOLDING: ${hitCount} impacts absorbed.`);
    }
    res.status(200).send("OK");
});

app.listen(4000, () => {
    console.log("🛡️ Local Target Server online on Port 4000. Ready for impact.");
});