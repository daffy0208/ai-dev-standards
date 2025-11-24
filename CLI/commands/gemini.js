const { GoogleGenerativeAI } = require('@google/generative-ai')
const chalk = require('chalk')
const ora = require('ora')

const geminiCommand = async (prompt, options) => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(chalk.red('Error: GEMINI_API_KEY environment variable not set.'))
    console.log(
      chalk.yellow(
        'Please get your API key from Google AI Studio and set it as an environment variable.'
      )
    )
    return
  }

  const spinner = ora('Thinking...').start()

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    spinner.succeed('Done!')
    console.log(chalk.blue('Gemini:'))
    console.log(text)
  } catch (error) {
    spinner.fail('Error')
    console.error(chalk.red('An error occurred while calling the Gemini API:'))
    console.error(error)
  }
}

module.exports = geminiCommand
