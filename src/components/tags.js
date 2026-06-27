import * as styles from './tags.module.css'

const Tags = ({ tags }) =>
  tags?.length > 0 && (
    <ul className={styles.tags} aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  )

export default Tags
