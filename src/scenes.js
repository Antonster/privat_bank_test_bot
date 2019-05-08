const WizardScene = require('telegraf/scenes/wizard');
const { URL } = require('url');
const Markup = require('telegraf/markup');
const fetch = require('node-fetch');

const bankBranchesData = {
  city: '',
  address: '',
};

const bankBranches = new WizardScene(
  'bank_branches',
  (ctx) => {
    ctx.reply(
      `
       Введите ваш город.
       "Выйти" - отменить операцию.
      `,
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === 'Выйти' || ctx.message.text === 'выйти') {
      ctx.reply('Операция отменена.');
      return ctx.scene.leave();
    }

    bankBranchesData.city = ctx.message.text;

    ctx.reply(
      `
        Введите название улицы.
        "Назад" - вернуться к выбору города.
        "Далее" - не выбирать улицу.
        "Выйти" - отменить операцию.
      `,
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    if (ctx.message.text === 'Выйти' || ctx.message.text === 'выйти') {
      ctx.reply('Операция отменена.');
      return ctx.scene.leave();
    }

    if (ctx.message.text === 'Назад' || ctx.message.text === 'назад') {
      ctx.reply(
        `
         Введите ваш город.
         "Выйти" - отменить операцию.
        `,
      );
      return ctx.wizard.back();
    }

    if (ctx.message.text === 'Далее' || ctx.message.text === 'далее') {
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
          ctx.reply('Похоже, ничего не найдено.');
        }
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
      })
      .catch(err => console.log(err));
    return ctx.scene.leave();
  },
);

module.exports = {
  bankBranches,
};
