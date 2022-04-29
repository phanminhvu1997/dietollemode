import ect from 'ect'
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const handleSendEmail = async (emailContent) => {
  if (emailContent && emailContent.to) {
    try {
      await sgMail.send({
        ...emailContent,
        from: process.env.EMAIL_SENDER_SENDGRID,
      })
      return true
    } catch (error) {
      if (error.response) {
        console.error(error.response.body)
      }
      throw new Error(error.message)
    }
  } else {
    throw new Error('Missing email content')
  }
}

export const genEmailTemplate = (template, param) => {
  const renderer = ect({ root: { page: template } })
  return renderer.render('page', param)
}

export default {
  handleSendEmail,
  genEmailTemplate,
}
