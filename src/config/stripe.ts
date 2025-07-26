import Stripe from 'stripe';
const SECRET_KEY="sk_test_51PopmqRwLdN4RpvjJn9kkDE3Qw0EcvtJYCASLDAkaiVYraUSfoRGNCHjwFc7zhtBYJkBDWm7Ayd6C7RQdkJeOK9d00eToKdbOy"
export const stripe = new Stripe(SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});
