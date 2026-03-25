import { HomepageSlider } from "@/components/slider/HomepageSlider"
import Features from "./components/Features"
import Footer from "@/components/navigation/Footer"
import QhubBanner from "./components/QhubBanner"

export default function Page() {
	return (
		<div>
			<HomepageSlider />
			<QhubBanner />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<Features />
			</div>
			<Footer />
		</div>
	)
}
