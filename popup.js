document
  .getElementById("save-api-key")
  .addEventListener("click", async (event) => {
    event.preventDefault();
    const apiKey = document.getElementById("api-key-input").value;

    document
      .querySelectorAll("#error-message p")
      .forEach((element) => element.remove());

    if (apiKey) {
      const isValidApiKey = await testApiKey(apiKey);

      if (isValidApiKey) {
        chrome.runtime.sendMessage(
          { action: "saveApiKey", apiKey },
          (response) => {
            if (response.message === "API key saved") {
              const successMessage = document.createElement("p");
              successMessage.textContent = "API key successfully saved!";
              successMessage.style.color = "#4caf50";
              successMessage.style.marginTop = "10px";
              successMessage.style.textAlign = "center";
              document
                .getElementById("api-key-form")
                .appendChild(successMessage);

              setTimeout(() => {
                window.close();
              }, 2000);
            }
          }
        );
      } else {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "Invalid API key. Please enter a valid key.";
        errorMessage.style.color = "#f44336";
        errorMessage.style.marginTop = "10px";
        document.getElementById("error-message").appendChild(errorMessage);
      }
    } else {
      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Please enter a valid API key.";
      errorMessage.style.color = "#f44336";
      errorMessage.style.marginTop = "10px";
      document.getElementById("error-message").appendChild(errorMessage);
    }
  });

async function testApiKey(apiKey) {
  try {
    const apiUrl = "https://api.openai.com/v1/models";
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };

    const response = await fetch(apiUrl, requestOptions);

    if (response.ok) {
      const responseData = await response.json();

      if (responseData && responseData.data && responseData.data.length > 0) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error testing OpenAI API key:", error);
    return false;
  }
}
