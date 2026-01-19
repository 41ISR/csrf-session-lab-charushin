import Reel from './Reel'


const SlotMachine = ({ symbols, isSpinning }) => {
    return (
        <div className="slots-container">
            {[0, 1, 2].map((index) => (
                <div className="slot-wrapper" key={index}>
                    <Reel symbol={symbols[index]} isSpinning={isSpinning} />
                </div>
            ))}
        </div>
    )
}

export default SlotMachine

