const CONTRACT_ADDRESS = "0xF5c191354BC695963080176e898B265F59BC358e";
const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address[]",
				"name": "hunters",
				"type": "address[]"
			},
			{
				"indexed": false,
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "Success",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "hunters",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "amounts",
				"type": "uint256[]"
			}
		],
		"name": "airdrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
let provider, signer, contract;

// Connect to MetaMask
async function connectWallet() {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        document.getElementById("walletAddress").innerText = await signer.getAddress();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        listenToEvents();
    } else {
        alert("Please install MetaMask!");
    }
}

// Airdrop tokens
async function airdropTokens() {
    const addresses = document.getElementById("addresses").value.split(",");
    const amounts = document.getElementById("amounts").value.split(",").map(Number);
    
    try {
        const tx = await contract.airdrop(addresses, amounts);
        await tx.wait();
        alert("Airdrop Successful!");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Withdraw tokens
async function withdrawTokens() {
    const amount = document.getElementById("withdrawAmount").value;
    try {
        const tx = await contract.withdraw(amount);
        await tx.wait();
        alert("Withdraw Successful!");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Pause the contract
async function pauseContract() {
    try {
        const tx = await contract.pause();
        await tx.wait();
        alert("Contract Paused!");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Unpause the contract
async function unpauseContract() {
    try {
        const tx = await contract.unpause();
        await tx.wait();
        alert("Contract Unpaused!");
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// Listen to contract events
function listenToEvents() {
    contract.on("Success", (hunters, amounts) => {
        document.getElementById("events").innerHTML += `<p>Airdrop Success: ${hunters.length} users</p>`;
    });

    contract.on("Withdrawn", (owner, amount) => {
        document.getElementById("events").innerHTML += `<p>Withdrawn: ${amount} tokens</p>`;
    });
}
