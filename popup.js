document.getElementById("save-api-key").addEventListener("click", (event) => {
  event.preventDefault();
  const apiKey = document.getElementById("api-key-input").value;
  if (apiKey) {
    chrome.runtime.sendMessage({ action: "saveApiKey", apiKey });
    alert("API key succesfully entered");
  } else {
    alert("Please enter a valid API key");
  }
});
