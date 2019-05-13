const WizardScene = require('telegraf/scenes/wizard');
const { URL } = require('url');
const fetch = require('node-fetch');

const botMessages = {
  city: `
    Введите ваш город.
    "Выйти" - отменить операцию.
  `,
  address: `
    Введите название улицы.
    "Назад" - вернуться к выбору города.
    "Выйти" - отменить операцию.
  `,
  repeat: `
    Хотите продолжать?
    "Да" - повторить операцию.
    "Нет" - закончить операцию.
  `,
  confirmation: `
    Выберите действие.
    "Да" - повторить операцию.
    "Нет" - закончить операцию.
  `,
  nothingFound: 'Похоже, ничего не найдено.',
  complete: 'Операция завершена.',
  error: 'Упс, что-то пошло не так. Попробуйте позже.',
};

const inputData = {
  city: '',
  address: '',
};

function firstStep(ctx) {
  ctx.reply(botMessages.city);
  return ctx.wizard.next();
}

function secondStep(ctx) {
  if (/выйти/i.test(ctx.message.text)) {
    ctx.reply(botMessages.complete);
    return ctx.scene.leave();
  }

  inputData.city = ctx.message.text;

  ctx.reply(botMessages.address);
  return ctx.wizard.next();
}

function thirdStep(ctx, scene) {
  if (/выйти/i.test(ctx.message.text)) {
    ctx.reply(botMessages.complete);
    return ctx.scene.leave();
  }

  if (/назад/i.test(ctx.message.text)) {
    ctx.reply(botMessages.city);
    return ctx.wizard.back();
  }

  inputData.address = ctx.message.text;

  if (scene === 'bank_branches') {
    fetch(
      new URL(
        `https://api.privatbank.ua/p24api/pboffice?json&city=${inputData.city}&address=${
          inputData.address
        }`,
      ),
      {
        method: 'GET',
      },
    )
      .then(res => res.json())
      .then((res) => {
        if (res.length === 0) {
          ctx.reply(botMessages.nothingFound);
        } else {
          for (let i = 0; i < res.length; i += 1) {
            const item = res[i];

            ctx.reply(
              `
                ${item.name}
                Страна: ${item.country}
                Город: ${item.city}
                Адрес: ${item.address}
                Индекс: ${item.index}
                Телефон: ${item.phone}
                email: ${item.email}
              `,
            );
          }
        }
      })
      .then(() => new Promise(res => setTimeout(res, 3000)))
      .then(() => {
        ctx.reply(botMessages.repeat);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply(botMessages.error);
      });
  }

  if (scene === 'atm') {
    fetch(
      new URL(
        `https://api.privatbank.ua/p24api/infrastructure?json&atm&address=${
          inputData.address
        }&city=${inputData.city}`,
      ),
      {
        method: 'GET',
      },
    )
      .then(res => res.json())
      .then((res) => {
        const { devices } = res;

        if (devices.length === 0) {
          ctx.reply(botMessages.nothingFound);
        } else {
          for (let i = 0; i < devices.length; i += 1) {
            const item = devices[i];
            const {
              mon, tue, wed, thu, fri, sat, sun, hol,
            } = item.tw;
            const fullData = item.fullAddressRu.split(',');

            ctx.reply(
              `
                ${item.placeRu}
                ${fullData[0]}
                ${fullData[1]}
                ${fullData[2]}
                ${fullData[3]}
                ${fullData[4]}
                Время работы:
                  Пн: ${mon}
                  Вт: ${tue}
                  Ср: ${wed}
                  Чт: ${thu}
                  Пт: ${fri}
                  Сб: ${sat}
                  Вс: ${sun}
                  Праздн: ${hol}
              `,
            );
          }
        }
      })
      .then(() => new Promise(res => setTimeout(res, 3000)))
      .then(() => {
        ctx.reply(botMessages.repeat);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply(botMessages.error);
      });
  }

  if (scene === 'bank_terminals') {
    fetch(
      new URL(
        `https://api.privatbank.ua/p24api/infrastructure?json&tso&address=${
          inputData.address
        }&city=${inputData.city}`,
      ),
      {
        method: 'GET',
      },
    )
      .then(res => res.json())
      .then((res) => {
        const { devices } = res;

        if (devices.length === 0) {
          ctx.reply(botMessages.nothingFound);
        } else {
          for (let i = 0; i < devices.length; i += 1) {
            const item = devices[i];
            const {
              mon, tue, wed, thu, fri, sat, sun, hol,
            } = item.tw;
            const fullData = item.fullAddressRu.split(',');

            ctx.reply(
              `
                ${item.placeRu}
                ${fullData[0]}
                ${fullData[1]}
                ${fullData[2]}
                ${fullData[3]}
                ${fullData[4]}
                Время работы:
                  Пн: ${mon}
                  Вт: ${tue}
                  Ср: ${wed}
                  Чт: ${thu}
                  Пт: ${fri}
                  Сб: ${sat}
                  Вс: ${sun}
                  Праздн: ${hol}
              `,
            );
          }
        }
      })
      .then(() => new Promise(res => setTimeout(res, 3000)))
      .then(() => {
        ctx.reply(botMessages.repeat);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply(botMessages.error);
      });
  }

  return ctx.wizard.next();
}

function fourthStep(ctx) {
  if (/да/i.test(ctx.message.text)) {
    ctx.reply(botMessages.city);
    return ctx.wizard.selectStep(1);
  }

  if (/нет/i.test(ctx.message.text)) {
    ctx.reply(botMessages.complete);
    return ctx.scene.leave();
  }

  ctx.reply(botMessages.confirmation);
  return ctx.wizard.selectStep(3);
}

const bankBranches = new WizardScene(
  'bank_branches',
  (ctx) => {
    firstStep(ctx);
  },
  (ctx) => {
    secondStep(ctx);
  },
  (ctx) => {
    thirdStep(ctx, 'bank_branches');
  },
  (ctx) => {
    fourthStep(ctx);
  },
);

const atm = new WizardScene(
  'atm',
  (ctx) => {
    firstStep(ctx);
  },
  (ctx) => {
    secondStep(ctx);
  },
  (ctx) => {
    thirdStep(ctx, 'atm');
  },
  (ctx) => {
    fourthStep(ctx);
  },
);

const bankTerminals = new WizardScene(
  'bank_terminals',
  (ctx) => {
    firstStep(ctx);
  },
  (ctx) => {
    secondStep(ctx);
  },
  (ctx) => {
    thirdStep(ctx, 'bank_terminals');
  },
  (ctx) => {
    fourthStep(ctx);
  },
);

module.exports = {
  bankBranches,
  atm,
  bankTerminals,
};
