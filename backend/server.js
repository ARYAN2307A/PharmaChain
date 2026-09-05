const app = require("./src/app");

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`PharmaChain backend running on port ${PORT}`);
});
