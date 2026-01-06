// src/services/auth.service.js

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const SALT_ROUNDS = 10

/**
 * Inscription utilisateur
 */
export const register = async ({ email, password }) => {
  // Vérifier si l'utilisateur existe déjà
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    throw new Error('Email déjà utilisé')
  }

  // Hasher le mot de passe
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // Créer l'utilisateur
  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'USER'
  })

  return sanitizeUser(user)
}

/**
 * Connexion utilisateur
 */
export const login = async ({ email, password }) => {
  const user = await User.findByEmail(email)
  if (!user) {
    throw new Error('Identifiants invalides')
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new Error('Identifiants invalides')
  }

  const token = generateToken(user)

  return {
    user: sanitizeUser(user),
    token
  }
}

/**
 * Génération du JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  )
}

/**
 * Supprimer les infos sensibles
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user
  return safeUser
}