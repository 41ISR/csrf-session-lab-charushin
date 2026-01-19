const Button = ({ children, onClick, className, ...rest }) => {
    const combinedClassName = `btn ${className || ''}` // добавляем свой класс к существующему

    return (
        <button onClick={onClick} className={combinedClassName} {...rest}>
            {children}
        </button>
    )
}

export default Button

