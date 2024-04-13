// Create Account
const createPin = function () {
  return String(Math.floor(Math.random() * 10)).repeat(4);
};

// Create random username
const createUsername = function () {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 7; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

// Create random date
const createDate = function (start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toISOString();
};

// Create random movements given by input value
const createMovements = function (movementsNumber) {
  const chooseMovements = [
    200, 450, -400, 3000, -650, -130, 70, 1300, 5000, 3400, -150, -790, -3210,
    -1000, 8500, -30,
  ];
  let i = 0;
  const movements = new Map();
  while (i <= movementsNumber) {
    const date = createDate(new Date(2020, 0, 1), new Date());
    const chooseNumber =
      chooseMovements[Math.floor(Math.random() * chooseMovements.length)];
    if (!movements.get(date)) {
      movements.set(date, chooseNumber);
      i++;
    }
  }
  return movements;
};

const account1 = {
  owner: "Enes Uraz",
  username: createUsername(),
  movements: createMovements(5),
  pin: createPin(),
  currency: "TRY",
  locale: "tr-TR",
};

const account2 = {
  owner: "Avicenna",
  username: createUsername(),
  movements: createMovements(7),
  pin: createPin(),
  currency: "UZS",
  locale: "uz-UZ",
};

const account3 = {
  owner: "Averos",
  username: createUsername(),
  movements: createMovements(8),
  pin: createPin(),
  currency: "EUR",
  locale: "es-ES",
};

const account4 = {
  owner: "Rhazes",
  username: createUsername(),
  movements: createMovements(6),
  pin: createPin(),
  currency: "IRR",
  locale: "fa-IR",
};

const accounts = [account1, account2, account3, account4];
let account;
// log accounts for testing
console.log(accounts);

// Format dates
function formatDate(date, locale) {
  const dayPassed = Math.round(
    Math.abs(date - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (dayPassed === 0) return "Today";
  if (dayPassed === 1) return "Yesterday";
  if (dayPassed <= 7) return `${dayPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
}

// Format currency
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

// Display movements
const movementsContainer = document.querySelector(".transaction-container");

function displayMovements(acc, sort = { sorted: false, sortValue: "" }) {
  let movementsCopy = [...acc.movements.keys()];
  if (sort.sorted) {
    if (sort.sortValue === "date") {
      movementsCopy = movementsCopy.sort(function (a, b) {
        return new Date(b) - new Date(a);
      });
    } else if (sort.sortValue === "amount") {
      movementsCopy = movementsCopy.sort(
        (a, b) =>
          Math.abs(acc.movements.get(b)) - Math.abs(acc.movements.get(a))
      );
    }
  }

  movementsContainer.innerHTML = "";
  movementsCopy.forEach((date) => {
    const typeClass = `transaction transaction--${
      acc.movements.get(date) > 0 ? "positive" : "negative"
    }`;
    const movement = acc.movements.get(date);

    const displayedDate = formatDate(new Date(date), acc.locale);
    const displayedAmount = formatCurrency(movement, acc.locale, acc.currency);

    const html = `
        <div class="${typeClass}">
            <span class="transaction__name">${displayedAmount} ${
      movement > 0 ? "deposit" : "widthDrawal"
    }</span>
            <span class="transaction__date">${displayedDate}</span>
            <span class="transaction__icon">${movement > 0 ? "⬆" : "⬇"}</span>
        </div>
        `;

    movementsContainer.insertAdjacentHTML("afterbegin", html);
  });
}

// Show current balance
const currentBalanceElement = document.querySelector(
  ".app-container-nav__balance"
);

function showCurrentBalance(acc) {
  const balance = acc.movements.values().reduce((cur, mov) => (cur += mov), 0);
  const displayedBalance = formatCurrency(balance, acc.locale, acc.currency);
  currentBalanceElement.innerHTML = displayedBalance;
}

// Toggle User interface
const loginContainer = document.querySelector(".login-container");
const mainContainer = document.querySelector(".main");

function toggleWindow() {
  loginContainer.classList.toggle("login-container--hidden");
  mainContainer.classList.toggle("main--hidden");
}

// Update User interface
function updateInterface(account) {
  displayMovements(account);
  showCurrentBalance(account);
}

// Authentication
const loginButton = document.getElementById("login");
const loginUsername = document.getElementById("username");
const loginSecret = document.getElementById("secret");
const logoutButton = document.getElementById("logout");

const mainText = document.querySelector(".main-nav__text");

const timerContainer = document.querySelector(".main-nav__timer");

let loginAccount, timer;

function logout() {
  toggleWindow();
}

function logoutTimer() {
  const tickTack = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    timerContainer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      logout();
    }

    time--;
  };

  let time = 180;
  tickTack();
  const timer = setInterval(tickTack, 1000);

  return timer;
}

loginButton.addEventListener("click", function (e) {
  e.preventDefault();
  const foundAccount = accounts.find(
    (acc) => acc.username === loginUsername.value
  );

  if (foundAccount?.pin === loginSecret.value) {
    mainText.innerHTML = `Welcome back, ${foundAccount.owner[0].toUpperCase()}${foundAccount.owner.slice(
      1
    )}`;
    toggleWindow();

    updateInterface(foundAccount);
    if (timer) clearInterval(timer);
    timer = logoutTimer();
    loginAccount = foundAccount;
  }
  loginSecret.value = loginUsername.value = "";
});

logoutButton.addEventListener("click", logout);

// Transfer money
const transferButton = document.getElementById("transfer");
const transferTo = document.querySelector(".transfer-form__username");
const transferAmount = document.querySelector(".transfer-form__amount");

transferButton.addEventListener("click", function (e) {
  e.preventDefault();
  const receiveAccount = accounts.find((acc) => acc.owner === transferTo.value);

  const amount = Number(transferAmount.value);

  if (
    receiveAccount &&
    transferAmount.value > 0 &&
    receiveAccount.username !== loginAccount.username
  ) {
    const date = new Date().toISOString();
    loginAccount.movements.set(date, -amount);
    receiveAccount.movements.set(date, amount);
    updateInterface(loginAccount);

    clearInterval(timer);
    timer = logoutTimer();
  }

  transferAmount.value = transferTo.value = "";
});

// Loan money
const loanButton = document.getElementById("loan");
const loanAmount = document.querySelector(".loan-form__amount");

loanButton.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(loanAmount.value);
  if (amount > 0) {
    const date = new Date().toISOString();
    loginAccount.movements.set(date, amount);

    updateInterface(loginAccount);

    clearInterval(timer);
    timer = logoutTimer();
  }
  loanAmount.value = "";
});

// Sort
const sortInput = document.getElementById("sort");

sortInput.addEventListener("change", function () {
  const value = sortInput.value;
  if (value !== "method") {
    displayMovements(loginAccount, {
      sorted: true,
      sortValue: value,
    });
  }
});

// Close account
const closeButton = document.getElementById("close");
const closeUsername = document.querySelector(".close-account__username");
const closeSecret = document.querySelector(".close-account__secret");

closeButton.addEventListener("click", function (e) {
  e.preventDefault();
  const closedAccount = accounts.find(
    (acc) => acc.username === closeUsername.value
  );

  if (closedAccount && closeSecret.value === closedAccount.pin) {
    const idx = accounts.findIndex(
      (acc) => acc.username === closedAccount.username
    );
    accounts.splice(idx, 1);
    toggleWindow();
    console.log(accounts);
  }

  closeSecret.value = closeUsername.value = "";
});
