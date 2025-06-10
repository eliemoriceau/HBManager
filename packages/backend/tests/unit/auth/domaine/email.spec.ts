import { test } from '@japa/runner'
import { Email } from '#auth/domain/email'

test.group('Email Value Object', () => {
  test('should create an Email instance with a valid email', ({ assert }) => {
    // Cas nominal
    const email = Email.fromString('User.Nametag@domain.co')

    assert.equal(email.get(), 'user.nametag@domain.co')
  })

  test('should throw an error for email without "@" symbol', ({ assert }) => {
    // Cas limite : email invalide sans @
    assert.throws(() => {
      Email.fromString('invalidemail.com')
    }, 'Email format invalid: invalidemail.com')
  })

  test('should throw an error for email with invalid domain', ({ assert }) => {
    // Cas limite : domaine invalide
    assert.throws(() => {
      Email.fromString('user@.com')
    }, 'Email format invalid: user@.com')
  })

  test('should normalize email to lowercase', ({ assert }) => {
    // Cas utile : normalisation en lowercase
    const email = Email.fromString('TEST@DOMAIN.COM')
    assert.equal(email.get(), 'test@domain.com')
  })

  test('should throw an error for empty email string', ({ assert }) => {
    // Cas extrême : chaîne vide
    assert.throws(() => {
      Email.fromString('')
    }, 'Email format invalid: ')
  })
})
