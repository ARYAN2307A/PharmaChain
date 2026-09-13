import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatMocha from "@nomicfoundation/hardhat-mocha";

export default {
    plugins: [hardhatEthers, hardhatMocha],

    solidity: "0.8.24",

    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    },

    networks: {
        localhost: {
            type: "http",
            url: "http://127.0.0.1:8545"
        }
    }
};