'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SocialIcon } from 'react-social-icons/component'
import 'react-social-icons/github'
import 'react-social-icons/linkedin'
import 'react-social-icons/twitter'
const SocialMediaLinks = () => {
    return (
        <div className='flex flex-row gap-4'>
            <SocialIcon url='https://github.com/rivuff' target='blank' bgColor='#454545' style={{height: 40, width: 40}}/>
            <SocialIcon url='https://www.linkedin.com/in/rivu-naskar/' target='blank' bgColor='#454545'style={{height: 40, width: 40}}/>
            <SocialIcon url='https://twitter.com/rivu_naskar' target='blank' bgColor='#454545' style={{height: 40, width: 40}}/>
            {/* <a href="https://github.com/rivuff" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faGithub} size="2x" />
            </a>
            <a href="https://www.youtube.com/channel/UCfKRZUU78XIcQvh1_QsdQyA" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} size="2x" />
            </a>
            <a href="https://www.linkedin.com/in/koushik-sarkar-iimc/" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
            </a> */}
        </div>
    );
};

export default SocialMediaLinks;