// Function to detect the command and return the text without the command
function extractText(input) {
  const regex = /\$gpt\s+(.+)/;
  const match = input.match(regex);
  return match ? match[1] : null;
}

async function callOpenAI(text) {
  try {
    const apiKey = await getApiKeyFromStorage();
    if (!apiKey) {
      console.error("No API key found");
      return null;
    }

    const apiUrl = "https://api.openai.com/v1/completions";
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: text,
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 1,
      }),
    };

    const response = await fetch(apiUrl, requestOptions);
    const responseData = await response.json();

    if (
      responseData &&
      responseData.choices &&
      responseData.choices[0] &&
      responseData.choices[0].text
    ) {
      return responseData.choices[0].text;
    } else {
      console.error(
        "Invalid OpenAI API response:",
        JSON.stringify(responseData, null, 2)
      );
      return null;
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return null;
  }
}

function getApiKeyFromStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiKey"], (result) => {
      resolve(result.apiKey);
    });
  });
}

function isEditable(element) {
  while (element) {
    if (element.contentEditable === "true") {
      return true;
    } else if (element.contentEditable === "false") {
      return false;
    }
    element = element.parentElement;
  }
  return false;
}

function attachKeydownListener(element) {
  const typingPlaceholder = "$gpt typing...";

  element.addEventListener("keydown", async (event) => {
    if (
      event.ctrlKey &&
      (event.code === "AltLeft" || event.code === "AltRight")
    ) {
      let activeElement = event.target;
      let inputText;

      if (
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA")
      ) {
        inputText = activeElement.value;
      } else if (activeElement && isEditable(activeElement)) {
        inputText = activeElement.innerHTML;
      }

      if (inputText) {
        const extractedText = extractText(inputText);

        if (extractedText) {
          if (isEditable(activeElement)) {
            activeElement.innerHTML = activeElement.innerHTML.replace(
              inputText,
              typingPlaceholder
            );
          } else {
            activeElement.value = activeElement.value.replace(
              inputText,
              typingPlaceholder
            );
          }

          const responseText = await callOpenAI(extractedText);
          if (responseText) {
            if (isEditable(activeElement)) {
              activeElement.innerHTML = activeElement.innerHTML.replace(
                typingPlaceholder,
                responseText
              );
            } else {
              activeElement.value = activeElement.value.replace(
                typingPlaceholder,
                responseText
              );
            }
          }
        }
      }
    }
  });
}

function observeNewElements() {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            attachKeydownListener(addedNode);
          }
        }
      }
    }
  });

  observer.observe(document, { childList: true, subtree: true });
}

attachKeydownListener(document);
observeNewElements();
