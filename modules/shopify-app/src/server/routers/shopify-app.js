import express from 'express'

import apiAuthentication from '../middlewares/check-auth'
import { shopifyApp } from '../controllers'

const shopifyappRouter = express.Router()

// middleware that is specific to this router
shopifyappRouter.use(apiAuthentication)

// store infomation
shopifyappRouter.get('/my-store', (req, res, next) => res.json(req.__store))
shopifyappRouter.get('/ruleset', shopifyApp.getRuleset)
shopifyappRouter.put('/ruleset', shopifyApp.updateRuleset)
shopifyappRouter.get('/pawpass', shopifyApp.getPawpassMember)

export default shopifyappRouter
