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
    "Далее" - не выбирать улицу.
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

const bankBranchesData = {
  city: '',
  address: '',
};

const bankBranches = new WizardScene(
  'bank_branches',
  (ctx) => {
    ctx.reply(botMessages.city);
    return ctx.wizard.next();
  },
  (ctx) => {
    if (/выйти/i.test(ctx.message.text)) {
      ctx.reply(botMessages.complete);
      return ctx.scene.leave();
    }

    bankBranchesData.city = ctx.message.text;

    ctx.reply(botMessages.address);
    return ctx.wizard.next();
  },
  (ctx) => {
    if (/выйти/i.test(ctx.message.text)) {
      ctx.reply(botMessages.complete);
      return ctx.scene.leave();
    }

    if (/назад/i.test(ctx.message.text)) {
      ctx.reply(botMessages.city);
      return ctx.wizard.back();
    }

    if (/далее/i.test(ctx.message.text)) {
      bankBranchesData.address = '';
    } else {
      bankBranchesData.address = ctx.message.text;
    }

    fetch(
      new URL(
        `https://api.privatbank.ua/p24api/pboffice?json&city=${bankBranchesData.city}&address=${
          bankBranchesData.address
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
      .then(() => new Promise(res => setTimeout(res, 5000)))
      .then(() => {
        ctx.reply(botMessages.repeat);
      })
      .catch((err) => {
        console.log(err);
        ctx.reply(botMessages.error);
      });
    return ctx.wizard.next();
  },
  (ctx) => {
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
  },
);

module.exports = {
  bankBranches,
};
