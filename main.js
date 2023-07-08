var enter = document.querySelector("#enter-btn");
var chat = document.querySelector("#chat");
var text = document.querySelector("textarea");

var apiKey = "";
fetch("/.netlify/functions/getApiKey")
  .then((response) => response.json())
  .then((data) => {
    // Handle the response data
    apiKey = data.data;
    console.log(apiKey);
  })
  .catch((error) => {
    // Handle any errors
    console.error(error);
  });

//Disable enter button if empty message or message too long (to prevent extra usage)
text.addEventListener("input", () => {
  if (text.value.length === 0 || text.value.length > 255) {
    enter.disabled = true;
  } else {
    enter.disabled = false;
  }
});

// Maintains the chat log
messageQueue = [
  {
    role: "system",
    content:
      "You are a helpful assistant, that is going to help the user write content on the given topics.",
  },
];

// Handles the ChatGPT API request logic
var getReply = async (message) => {
  messageQueue.push({ role: "user", content: message });

  var response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      // Request parameters
      model: "gpt-3.5-turbo",
      messages: messageQueue,
    }),
  });

  reply = await response.json();
  ans = reply.choices[0].message;
  messageQueue.push(ans);
  return ans.content;
};

// Handles the click for the enter button
var handleEnter = async () => {
  var newDiv = document.createElement("p");
  newDiv.innerHTML = `You: ${text.value}`;
  chat.appendChild(newDiv);
  var message = text.value;
  text.value = "";
  enter.disabled = true;
  text.disabled = true;
  try {
    var ans = await getReply(message);

    var reply = document.createElement("p");
    reply.innerHTML = `Assistant: ${ans}`;
    chat.appendChild(reply);
  } catch (error) {
    var reply = document.createElement("p");
    reply.innerHTML = error;
    chat.appendChild(reply);
  }
  text.disabled = false;
};

enter.addEventListener("click", handleEnter);
