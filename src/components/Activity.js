import { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2'
import randomcolor from 'randomcolor'
import moment from 'moment'

import { getRepoCommits, getRepoCollaborators } from "../utils/github.js";
import { last7Days, last4Weeks, last6Months } from "../utils/dateUtils.js";

const Activity = () => {
    const [repoURL, setRepoURL] = useState('https://api.github.com/repos/filipclavin/b-e-v')
    const [datasets, setDatasets] = useState()
    const [times, setTimes] = useState(last7Days())
    const [selectedSpan, setSelectedSpan] = useState(1)

    useEffect(async () => {
        setData()
    }, [times, repoURL])

    const setData = async () => {

        const result = []

        const today = new Date()
        today.setHours(0, 0, 0)

        const collaborators = await getRepoCollaborators(repoURL)
        const commits = await getRepoCommits(repoURL)


        await collaborators.forEach(coll => {
            const week = [0, 0, 0, 0, 0, 0, 0]
            const weeks = [0, 0, 0, 0]
            const months = [0, 0, 0, 0, 0, 0]

            commits.forEach(commit => {
                const commitDate = new Date(commit.date)
                commitDate.setHours(0, 0, 0)

                const diffTime = Math.abs(today - commitDate)
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
                const diffWeeks = Math.ceil(diffDays / 7);
                const diffMonths = Math.ceil(diffDays / 30)

                if (diffDays <= 7 && selectedSpan === 1) {

                    if (commit.name === coll) {

                        week[diffDays]++
                    }
                }

                if (diffDays <= 28 && selectedSpan === 2) {
                    if (commit.name === coll) weeks[diffWeeks]++
                }

                if (diffDays <= 182 && selectedSpan === 3) {
                    if (commit.name === coll) months[diffMonths]++
                }
            })

            let d = week.reverse();
            if(selectedSpan === 1) d = week.reverse();
            else if(selectedSpan === 2) d = weeks.reverse()
            else if(selectedSpan === 3) d = months.reverse()

            result.push({
                label: coll,
                data: d.reverse(),
                fill: false,
                borderColor: randomcolor
            })

        })

        setDatasets(result)

        console.log(datasets);

    }

    return (
        <>
            <div>
                <button onClick={() => {
                    setTimes(last7Days())
                    setSelectedSpan(1)
                }
                }>7 Days</button>
                <button onClick={() => {
                    setTimes(last4Weeks())
                    setSelectedSpan(2)
                }
                }>4 Weeks</button>
                <button onClick={() => {
                    setTimes(last6Months())
                    setSelectedSpan(3)
                }
                }>6 Months</button>
            </div>
            <Line
                data={{
                    labels: times,
                    datasets: datasets
                }}
            />
        </>
    )
}

export default Activity
