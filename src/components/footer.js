import React from 'react'

import Container from './container'
import * as styles from './footer.module.css'

const Footer = () => (
  <Container as="footer">
    <div className={styles.container}>
      Built with ❤️ by <a href="/">Aaron Russell</a>
    </div>
  </Container>
)

export default Footer
