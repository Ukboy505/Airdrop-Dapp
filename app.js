// app.js

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

// Elements from the HTML
const connectButton = document.getElementById("connectButton");
const walletID = document.getElementById("walletID");
const reloadButton = document.getElementById("reloadButton");
const installAlert = document.getElementById("installAlert");
const mobileDeviceWarning = document.getElementById("mobileDeviceWarning");

const startLoading = () => {
  connectButton.classList.add("loadingButton");
};

const stopLoading = () => {
  const timeout = setTimeout(() => {
    connectButton.classList.remove("loadingButton");
    clearTimeout(timeout);
  }, 300);
};

// Simplified mobile detection
const isMobile = () => {
  return /Mobi/i.test(window.navigator.userAgent);
};

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    startLoading();
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      // Initialize provider, signer, and contract
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const account = await signer.getAddress();
      walletID.innerHTML = `Wallet connected: <span>${account}</span>`;
      
      // Set up contract event listeners once initialized
      listenToEvents();
      stopLoading();
    } catch (error) {
      console.error(error, error.code);
      alert(error.message || error.code);
      stopLoading();
    }
  } else {
    if (isMobile()) {
      mobileDeviceWarning.classList.add("show");
    } else {
      window.open("https://metamask.io/download/", "_blank");
      installAlert.classList.add("show");
    }
  }
});

reloadButton.addEventListener("click", () => {
  window.location.reload();
});

// Airdrop tokens function
async function airdropTokens() {
  if (!contract) {
    alert("Contract not initialized. Please connect your wallet first.");
    return;
  }
  const addressesInput = document.getElementById("addresses").value;
  const amountsInput = document.getElementById("amounts").value;
  
  // Split by commas, trim whitespace, and filter out empty values
  const addresses = addressesInput.split(",").map(addr => addr.trim()).filter(addr => addr);
  // Convert each amount assuming the token has 18 decimals
  const amounts = amountsInput.split(",").map(amount => {
    const trimmed = amount.trim();
    return trimmed ? ethers.utils.parseUnits(trimmed, 18) : "0";
  });
  
  try {
    const tx = await contract.airdrop(addresses, amounts);
    await tx.wait();
    alert("Airdrop Successful!");
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Withdraw tokens function
async function withdrawTokens() {
  if (!contract) {
    alert("Contract not initialized. Please connect your wallet first.");
    return;
  }
  const amountInput = document.getElementById("withdrawAmount").value;
  try {
    // Convert the entered amount (assumed in plain number format) to token units (18 decimals)
    const amount = ethers.utils.parseUnits(amountInput, 18);
    const tx = await contract.withdraw(amount);
    await tx.wait();
    alert("Withdraw Successful!");
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Pause the contract function
async function pauseContract() {
  if (!contract) {
    alert("Contract not initialized. Please connect your wallet first.");
    return;
  }
  try {
    const tx = await contract.pause();
    await tx.wait();
    alert("Contract Paused!");
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Unpause the contract function
async function unpauseContract() {
  if (!contract) {
    alert("Contract not initialized. Please connect your wallet first.");
    return;
  }
  try {
    const tx = await contract.unpause();
    await tx.wait();
    alert("Contract Unpaused!");
  } catch (error) {
    console.error(error);
    alert(`Error: ${error.message}`);
  }
}

// Listen to contract events
function listenToEvents() {
  if (!contract) {
    console.warn("Contract not initialized, cannot listen to events.");
    return;
  }
  
  contract.on("Success", (hunters, amounts) => {
    document.getElementById("events").innerHTML += `<p>Airdrop Success: ${hunters.length} users</p>`;
  });

  contract.on("Withdrawn", (owner, amount) => {
    const amountFormatted = ethers.utils.formatUnits(amount, 18);
    document.getElementById("events").innerHTML += `<p>Withdrawn: ${amountFormatted} tokens</p>`;
  });
}
