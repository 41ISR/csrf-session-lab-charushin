const Input = ({ value, onChange, className, ...rest }) => {
    const combinedClassName = `${className || ''}`
    return <input value={value} onChange={onChange} className={combinedClassName} {...rest} />
}

export default Input

