import cityscapeDesktop from '../assets/cityscape-full-desktop.png'
import clouds from '../assets/clouds.png'
import HorizontalAnimation from './HorizontalAnimation'

const CityscapeScroll = () => {
  return (
    <div className="relative h-[250px] w-full overflow-hidden md:h-[462px]">
      <div className="absolute top-0 h-[150px] md:h-[232px]">
        <HorizontalAnimation to={0} from={-50}>
          <img src={clouds.src} alt="Clouds" />
          <img src={clouds.src} alt="Clouds" />
        </HorizontalAnimation>
      </div>
      <div className="absolute bottom-0 h-[250px] md:h-[434px]">
        <HorizontalAnimation to={-50} from={0}>
          <img src={cityscapeDesktop.src} alt="Cityscape" />
          <img src={cityscapeDesktop.src} alt="Cityscape" />
        </HorizontalAnimation>
      </div>
    </div>
  )
}

export default CityscapeScroll
