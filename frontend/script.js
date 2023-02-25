import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.forms[0];
const chatContainer = document.getElementById("chat-container");

let loadInterval;

// ... loader when wating for reponse
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      if (text[index] === "\n") {
        element.innerHTML += "<br>";
      } else if (text[index] === " ") {
        element.innerHTML += "&nbsp;&nbsp;";
      } else {
        element.innerHTML += text[index];
      }
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// function to generate unique id for every msg
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexDecimal = randomNumber.toString(16); // convert number to hex decimal (16 base)

  return `id-${timestamp}-${hexDecimal}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
            <div class="wrapper ${isAi && "ai"}">
                <div class="chat">
                    <div class="profile">
                        <img 
                            src="${isAi ? bot : user}"
                            alt="${isAi ? "bot" : "user"}"
                        />
                    </div>
                    <div class="message" id=${uniqueId}>
                        ${value}
                    </div>
                </div>
            </div>
        `;
}

// asynchronous function doesn't block the main thread and allows other code to run while it's executing
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  //bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from backend
  const response = await fetch("https://buoya-chat-ai.onrender.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = " ";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    console.log(err);

    messageDiv.innerHTML = "Something Went Wrong";
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  // if enter key is called (13 ===> Enter )
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
