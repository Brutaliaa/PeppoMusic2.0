# PeppoMusic 2.0

PeppoMusic 2.0 should be, hopefully, my new music bot on Discord.
Created with other packages before, I had so much troubles making it
work constantly without having to fix it every 2 months. It's my
attempt to make a good bot without issues for once.

## Installation

You can simply download the files in here and use it like it. You can use
a .bat file or .sh file depending on your OS to open the bot. Don't
hesitate to open an issue if anything. That being said, you should
install the dependencies first before. I use PNPM for this project, since
I create a lot of stuff using Node.js, I hated needing to redownload the
packages everytimes. You can, however, use NPM but I highly recommend trying PNPM.

With Powershell

```bash
Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
```

On POSIX systems

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -

# If curl not installed, you can use wget :
wget -qO- https://get.pnpm.io/install.sh | sh -
```

Then simply download the dependencies

```bash
pnpm install
```

You should be good to go

## Usage

You can use pnpm to start the bot

```bash
pnpm start
```

## Features

This bot has error handlers where it will sends you a message when an error has occured. Don't
forget to put your Discord ID in the [env file](./private/privateTemplate.env) to have this feature. Otherwise, it will just skips it.

```env
OWNER_ID=123456789012345678
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
