import express from 'express';
import userFacade from '../facades/userFacade';

const router = express.Router();

router.post('/', async function (req, res, next) {
  try{
    let newUser = req.body;
    newUser.role = 'user'; // Setting role manually, so even if someone tried to sneak in a role, it's still a user!
    const status = await userFacade.addUser(newUser)
    res.json({status})
  }catch (err) {
    next(err)
  }
})

router.get('/:userName', async function (req, res, next) {
  try{
    const _userName = req.params.userName;
    const user = await userFacade.getUser(_userName);
    const { name, userName } = user;
    const userDTO = { name, userName }
    res.json(userDTO);
  } catch (err) {
    next(err)
  }
});

router.get('/', async function (req, res, next) {
  try {
    const users = await userFacade.getAllUsers();
    const usersDTO = users.map((user) => {
      const { name, userName } = user;
      return { name, userName }
    })
    res.json(usersDTO);
  } catch(err) {
    next(err)
  }
});

router.delete('/:userName', async function (req, res, next) {
  try {
    const _userName = req.params.userName;
    const status = await userFacade.deleteUser(_userName);
    res.json({status});
  }catch (err){
    next(err)
  }
})

module.exports = router;