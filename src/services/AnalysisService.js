const {
    QuizSession,
    QuizResponse,
    Question,
    Driver
} = require('../models');
const {
    Op
} = require('sequelize');

class AnalysisService {
    /**
     * Get comprehensive analysis with detailed explanations
     */
    static async getComprehensiveAnalysis(options = {}) {
        const {
            start_date,
            end_date,
            driver_id,
            language
        } = options;

        // Build where clause for date range
        const sessionWhereClause = {};
        if (start_date && end_date) {
            sessionWhereClause.quiz_date = {
                [Op.between]: [start_date, end_date]
            };
        } else if (start_date) {
            sessionWhereClause.quiz_date = {
                [Op.gte]: start_date
            };
        } else if (end_date) {
            sessionWhereClause.quiz_date = {
                [Op.lte]: end_date
            };
        }

        if (driver_id) {
            sessionWhereClause.driver_id = driver_id;
        }

        // Get all sessions in the date range
        const sessions = await QuizSession.findAll({
            where: sessionWhereClause,
            include: [{
                model: Driver,
                as: 'driver',
                attributes: ['id', 'name', 'phone_number', 'language', 'total_quizzes', 'total_correct', 'streak']
            }],
            order: [
                ['quiz_date', 'DESC']
            ]
        });

        // Get all responses for these sessions
        const sessionIds = sessions.map(s => s.id);
        const responses = await QuizResponse.findAll({
            where: {
                quiz_session_id: {
                    [Op.in]: sessionIds
                }
            },
            include: [{
                model: Question,
                as: 'question',
                attributes: ['id', 'question_text', 'topic', 'language', 'correct_option']
            }]
        });

        // Calculate comprehensive metrics
        const analysis = {
            overview: this._calculateOverviewMetrics(sessions, responses),
            performance_trends: this._calculatePerformanceTrends(sessions),
            driver_analysis: this._analyzeDrivers(sessions, responses),
            question_analysis: this._analyzeQuestions(responses, language),
            engagement_metrics: this._calculateEngagementMetrics(sessions),
            time_analysis: this._analyzeTimePatterns(sessions),
            insights: [],
            recommendations: []
        };

        // Generate insights and recommendations
        analysis.insights = this._generateInsights(analysis);
        analysis.recommendations = this._generateRecommendations(analysis);

        return analysis;
    }

    /**
     * Calculate overview metrics
     */
    static _calculateOverviewMetrics(sessions, responses) {
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(s => s.completed).length;
        const uniqueDrivers = new Set(sessions.map(s => s.driver_id)).size;

        const totalQuestions = responses.length;
        const correctAnswers = responses.filter(r => r.correct).length;
        const overallAccuracy = totalQuestions > 0 ?
            Math.round((correctAnswers / totalQuestions) * 10000) / 100 : 0;

        const scores = sessions.filter(s => s.completed).map(s => s.calculateScore());
        const averageScore = scores.length > 0 ?
            scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;

        const medianScore = this._calculateMedian(scores);
        const scoreDistribution = this._calculateScoreDistribution(scores);

        const completionRate = totalSessions > 0 ?
            Math.round((completedSessions / totalSessions) * 10000) / 100 : 0;

        return {
            total_sessions: totalSessions,
            completed_sessions: completedSessions,
            completion_rate: completionRate,
            unique_drivers: uniqueDrivers,
            total_questions_answered: totalQuestions,
            total_correct_answers: correctAnswers,
            overall_accuracy: overallAccuracy,
            average_score: Math.round(averageScore * 100) / 100,
            median_score: Math.round(medianScore * 100) / 100,
            score_distribution: scoreDistribution,
            explanation: `Out of ${totalSessions} total quiz sessions, ${completedSessions} were completed (${completionRate}% completion rate). ` +
                `${uniqueDrivers} unique drivers participated. The overall accuracy across all questions was ${overallAccuracy}%, ` +
                `with an average score of ${Math.round(averageScore * 100) / 100}% and median score of ${Math.round(medianScore * 100) / 100}%.`
        };
    }

    /**
     * Calculate performance trends
     */
    static _calculatePerformanceTrends(sessions) {
        const dailyStats = {};

        sessions.forEach(session => {
            const date = session.quiz_date;
            if (!dailyStats[date]) {
                dailyStats[date] = {
                    date: date,
                    sessions: [],
                    scores: []
                };
            }
            if (session.completed) {
                dailyStats[date].sessions.push(session);
                dailyStats[date].scores.push(session.calculateScore());
            }
        });

        const trendData = Object.values(dailyStats)
            .map(day => ({
                date: day.date,
                session_count: day.sessions.length,
                average_score: day.scores.length > 0 ?
                    Math.round((day.scores.reduce((a, b) => a + b, 0) / day.scores.length) * 100) / 100 : 0,
                total_questions: day.sessions.reduce((sum, s) => sum + (s.total_questions || 0), 0),
                total_correct: day.sessions.reduce((sum, s) => sum + (s.total_correct || 0), 0)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        // Calculate trend direction
        let trendDirection = 'stable';
        let trendExplanation = '';

        if (trendData.length >= 2) {
            const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
            const secondHalf = trendData.slice(Math.floor(trendData.length / 2));

            const firstAvg = firstHalf.reduce((sum, d) => sum + d.average_score, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((sum, d) => sum + d.average_score, 0) / secondHalf.length;

            const change = secondAvg - firstAvg;

            if (change > 5) {
                trendDirection = 'improving';
                trendExplanation = `Performance is improving with an average score increase of ${Math.round(change * 100) / 100}% points.`;
            } else if (change < -5) {
                trendDirection = 'declining';
                trendExplanation = `Performance is declining with an average score decrease of ${Math.round(Math.abs(change) * 100) / 100}% points.`;
            } else {
                trendExplanation = `Performance remains relatively stable with minimal change (${Math.round(change * 100) / 100}% points).`;
            }
        }

        return {
            daily_trends: trendData,
            trend_direction: trendDirection,
            explanation: `Performance trends show ${trendData.length} days of activity. ${trendExplanation} ` +
                `The data indicates ${trendData.reduce((sum, d) => sum + d.session_count, 0)} total completed sessions over the period.`
        };
    }

    /**
     * Analyze driver performance
     */
    static _analyzeDrivers(sessions, responses) {
        const driverStats = {};

        sessions.forEach(session => {
            const driverId = session.driver_id;
            if (!driverStats[driverId]) {
                driverStats[driverId] = {
                    driver_id: driverId,
                    driver_name: session.driver ? session.driver.name : 'Unknown',
                    driver_phone: session.driver ? session.driver.phone_number : null,
                    driver_language: session.driver ? session.driver.language : null,
                    total_sessions: 0,
                    completed_sessions: 0,
                    total_questions: 0,
                    total_correct: 0,
                    scores: [],
                    streak: session.driver ? session.driver.streak : 0,
                    last_quiz_date: null
                };
            }

            driverStats[driverId].total_sessions++;
            if (session.completed) {
                driverStats[driverId].completed_sessions++;
                driverStats[driverId].total_questions += session.total_questions || 0;
                driverStats[driverId].total_correct += session.total_correct || 0;
                driverStats[driverId].scores.push(session.calculateScore());
            }
            if (!driverStats[driverId].last_quiz_date ||
                new Date(session.quiz_date) > new Date(driverStats[driverId].last_quiz_date)) {
                driverStats[driverId].last_quiz_date = session.quiz_date;
            }
        });

        // Calculate per-driver metrics
        const driverAnalysis = Object.values(driverStats).map(driver => {
            const avgScore = driver.scores.length > 0 ?
                driver.scores.reduce((a, b) => a + b, 0) / driver.scores.length : 0;
            const accuracy = driver.total_questions > 0 ?
                Math.round((driver.total_correct / driver.total_questions) * 10000) / 100 : 0;
            const completionRate = driver.total_sessions > 0 ?
                Math.round((driver.completed_sessions / driver.total_sessions) * 10000) / 100 : 0;

            return {
                ...driver,
                average_score: Math.round(avgScore * 100) / 100,
                accuracy: accuracy,
                completion_rate: completionRate,
                performance_category: this._categorizePerformance(avgScore, accuracy, completionRate)
            };
        });

        // Top and bottom performers
        const sortedByScore = [...driverAnalysis].sort((a, b) => b.average_score - a.average_score);
        const topPerformers = sortedByScore.slice(0, 10);
        const bottomPerformers = sortedByScore.slice(-10).reverse();

        // Most active drivers
        const sortedByActivity = [...driverAnalysis].sort((a, b) => b.completed_sessions - a.completed_sessions);
        const mostActive = sortedByActivity.slice(0, 10);

        return {
            total_drivers: driverAnalysis.length,
            average_sessions_per_driver: driverAnalysis.length > 0 ?
                Math.round((driverAnalysis.reduce((sum, d) => sum + d.completed_sessions, 0) / driverAnalysis.length) * 100) / 100 : 0,
            top_performers: topPerformers,
            bottom_performers: bottomPerformers,
            most_active_drivers: mostActive,
            performance_distribution: this._calculatePerformanceDistribution(driverAnalysis),
            explanation: `Analysis of ${driverAnalysis.length} drivers shows an average of ` +
                `${Math.round((driverAnalysis.reduce((sum, d) => sum + d.completed_sessions, 0) / driverAnalysis.length) * 100) / 100} ` +
                `completed sessions per driver. Top performers average ${Math.round(topPerformers[0]?.average_score || 0)}% ` +
                `while drivers needing support average ${Math.round(bottomPerformers[0]?.average_score || 0)}%.`
        };
    }

    /**
     * Analyze question performance
     */
    static _analyzeQuestions(responses, languageFilter) {
        const questionStats = {};

        responses.forEach(response => {
            const questionId = response.question_id;
            if (!questionStats[questionId]) {
                questionStats[questionId] = {
                    question_id: questionId,
                    question_text: response.question ? response.question.question_text : 'Unknown',
                    topic: response.question ? response.question.topic : null,
                    language: response.question ? response.question.language : null,
                    total_attempts: 0,
                    correct_attempts: 0,
                    incorrect_attempts: 0,
                    option_selections: {}
                };
            }

            questionStats[questionId].total_attempts++;
            if (response.correct) {
                questionStats[questionId].correct_attempts++;
            } else {
                questionStats[questionId].incorrect_attempts++;
            }

            // Track option selections
            const selectedOption = response.selected_option;
            if (!questionStats[questionId].option_selections[selectedOption]) {
                questionStats[questionId].option_selections[selectedOption] = 0;
            }
            questionStats[questionId].option_selections[selectedOption]++;
        });

        // Calculate metrics for each question
        const questionAnalysis = Object.values(questionStats)
            .filter(q => !languageFilter || q.language === languageFilter)
            .map(question => {
                const accuracy = question.total_attempts > 0 ?
                    Math.round((question.correct_attempts / question.total_attempts) * 10000) / 100 : 0;

                return {
                    ...question,
                    accuracy: accuracy,
                    difficulty_level: this._categorizeDifficulty(accuracy),
                    most_common_mistake: this._findMostCommonMistake(question.option_selections)
                };
            });

        // Categorize questions
        const easyQuestions = questionAnalysis.filter(q => q.difficulty_level === 'easy');
        const mediumQuestions = questionAnalysis.filter(q => q.difficulty_level === 'medium');
        const hardQuestions = questionAnalysis.filter(q => q.difficulty_level === 'hard');

        // Most and least answered correctly
        const sortedByAccuracy = [...questionAnalysis].sort((a, b) => b.accuracy - a.accuracy);
        const easiestQuestions = sortedByAccuracy.slice(0, 10);
        const hardestQuestions = sortedByAccuracy.slice(-10).reverse();

        // By topic
        const topicStats = {};
        questionAnalysis.forEach(q => {
            const topic = q.topic || 'Uncategorized';
            if (!topicStats[topic]) {
                topicStats[topic] = {
                    topic: topic,
                    total_questions: 0,
                    total_attempts: 0,
                    total_correct: 0
                };
            }
            topicStats[topic].total_questions++;
            topicStats[topic].total_attempts += q.total_attempts;
            topicStats[topic].total_correct += q.correct_attempts;
        });

        const topicAnalysis = Object.values(topicStats).map(topic => ({
            ...topic,
            average_accuracy: topic.total_attempts > 0 ?
                Math.round((topic.total_correct / topic.total_attempts) * 10000) / 100 : 0
        })).sort((a, b) => b.average_accuracy - a.average_accuracy);

        return {
            total_questions: questionAnalysis.length,
            difficulty_distribution: {
                easy: easyQuestions.length,
                medium: mediumQuestions.length,
                hard: hardQuestions.length
            },
            easiest_questions: easiestQuestions,
            hardest_questions: hardestQuestions,
            topic_analysis: topicAnalysis,
            explanation: `Analysis of ${questionAnalysis.length} questions shows ${easyQuestions.length} easy questions ` +
                `(${Math.round((easyQuestions.length / questionAnalysis.length) * 100)}%), ` +
                `${mediumQuestions.length} medium questions (${Math.round((mediumQuestions.length / questionAnalysis.length) * 100)}%), ` +
                `and ${hardQuestions.length} hard questions (${Math.round((hardQuestions.length / questionAnalysis.length) * 100)}%). ` +
                `The easiest questions have ${Math.round(easiestQuestions[0]?.accuracy || 0)}% accuracy while the hardest have ${Math.round(hardestQuestions[0]?.accuracy || 0)}% accuracy.`
        };
    }

    /**
     * Calculate engagement metrics
     */
    static _calculateEngagementMetrics(sessions) {
        const dailyEngagement = {};
        const driverEngagement = {};

        sessions.forEach(session => {
            const date = session.quiz_date;
            if (!dailyEngagement[date]) {
                dailyEngagement[date] = {
                    date: date,
                    unique_drivers: new Set(),
                    total_sessions: 0,
                    completed_sessions: 0
                };
            }
            dailyEngagement[date].unique_drivers.add(session.driver_id);
            dailyEngagement[date].total_sessions++;
            if (session.completed) {
                dailyEngagement[date].completed_sessions++;
            }

            // Per driver engagement
            const driverId = session.driver_id;
            if (!driverEngagement[driverId]) {
                driverEngagement[driverId] = {
                    driver_id: driverId,
                    days_active: new Set(),
                    total_sessions: 0,
                    completed_sessions: 0
                };
            }
            driverEngagement[driverId].days_active.add(date);
            driverEngagement[driverId].total_sessions++;
            if (session.completed) {
                driverEngagement[driverId].completed_sessions++;
            }
        });

        const dailyEngagementData = Object.values(dailyEngagement).map(day => ({
            date: day.date,
            unique_drivers: day.unique_drivers.size,
            total_sessions: day.total_sessions,
            completed_sessions: day.completed_sessions,
            engagement_rate: day.total_sessions > 0 ?
                Math.round((day.completed_sessions / day.total_sessions) * 10000) / 100 : 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        const driverEngagementData = Object.values(driverEngagement).map(driver => ({
            driver_id: driver.driver_id,
            days_active: driver.days_active.size,
            total_sessions: driver.total_sessions,
            completed_sessions: driver.completed_sessions,
            average_sessions_per_day: driver.days_active.size > 0 ?
                Math.round((driver.completed_sessions / driver.days_active.size) * 100) / 100 : 0
        }));

        const averageDaysActive = driverEngagementData.length > 0 ?
            driverEngagementData.reduce((sum, d) => sum + d.days_active, 0) / driverEngagementData.length : 0;

        return {
            daily_engagement: dailyEngagementData,
            average_days_active_per_driver: Math.round(averageDaysActive * 100) / 100,
            most_engaged_drivers: [...driverEngagementData]
                .sort((a, b) => b.days_active - a.days_active)
                .slice(0, 10),
            peak_engagement_day: dailyEngagementData.length > 0 ?
                dailyEngagementData.reduce((max, day) =>
                    day.unique_drivers > max.unique_drivers ? day : max
                ) : null,
            explanation: `Engagement analysis shows drivers are active an average of ${Math.round(averageDaysActive * 100) / 100} days. ` +
                `The peak engagement day had ${dailyEngagementData.length > 0 ? 
                            Math.max(...dailyEngagementData.map(d => d.unique_drivers)) : 0} unique drivers participating.`
        };
    }

    /**
     * Analyze time patterns
     */
    static _analyzeTimePatterns(sessions) {
        const hourDistribution = {};
        const dayOfWeekDistribution = {};

        sessions.forEach(session => {
            const createdAt = new Date(session.created_at);
            const hour = createdAt.getHours();
            const dayOfWeek = createdAt.getDay(); // 0 = Sunday, 6 = Saturday

            if (!hourDistribution[hour]) {
                hourDistribution[hour] = 0;
            }
            hourDistribution[hour]++;

            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (!dayOfWeekDistribution[dayNames[dayOfWeek]]) {
                dayOfWeekDistribution[dayNames[dayOfWeek]] = 0;
            }
            dayOfWeekDistribution[dayNames[dayOfWeek]]++;
        });

        const peakHour = Object.entries(hourDistribution)
            .sort((a, b) => b[1] - a[1])[0];
        const peakDay = Object.entries(dayOfWeekDistribution)
            .sort((a, b) => b[1] - a[1])[0];

        return {
            hour_distribution: hourDistribution,
            day_of_week_distribution: dayOfWeekDistribution,
            peak_hour: peakHour ? {
                hour: parseInt(peakHour[0]),
                sessions: peakHour[1],
                time_period: this._getTimePeriod(parseInt(peakHour[0]))
            } : null,
            peak_day: peakDay ? {
                day: peakDay[0],
                sessions: peakDay[1]
            } : null,
            explanation: `Time pattern analysis shows peak activity at ${peakHour ? this._getTimePeriod(parseInt(peakHour[0])) : 'N/A'} ` +
                `(${peakHour ? peakHour[1] : 0} sessions) and most activity on ${peakDay ? peakDay[0] : 'N/A'} ` +
                `(${peakDay ? peakDay[1] : 0} sessions).`
        };
    }

    /**
     * Generate insights
     */
    static _generateInsights(analysis) {
        const insights = [];

        // Overall performance insight
        if (analysis.overview.overall_accuracy < 60) {
            insights.push({
                type: 'warning',
                category: 'Performance',
                title: 'Low Overall Accuracy',
                description: `The overall accuracy of ${analysis.overview.overall_accuracy}% is below the recommended threshold of 60%. ` +
                    `This suggests that questions may be too difficult or drivers need additional training.`,
                impact: 'high',
                actionable: true
            });
        } else if (analysis.overview.overall_accuracy > 85) {
            insights.push({
                type: 'success',
                category: 'Performance',
                title: 'Excellent Overall Performance',
                description: `The overall accuracy of ${analysis.overview.overall_accuracy}% indicates strong driver knowledge and understanding.`,
                impact: 'low',
                actionable: false
            });
        }

        // Completion rate insight
        if (analysis.overview.completion_rate < 70) {
            insights.push({
                type: 'warning',
                category: 'Engagement',
                title: 'Low Completion Rate',
                description: `Only ${analysis.overview.completion_rate}% of quiz sessions are being completed. ` +
                    `This may indicate that quizzes are too long, too difficult, or drivers are losing interest.`,
                impact: 'high',
                actionable: true
            });
        }

        // Trend insight
        if (analysis.performance_trends.trend_direction === 'declining') {
            insights.push({
                type: 'warning',
                category: 'Trends',
                title: 'Declining Performance Trend',
                description: analysis.performance_trends.explanation,
                impact: 'medium',
                actionable: true
            });
        } else if (analysis.performance_trends.trend_direction === 'improving') {
            insights.push({
                type: 'success',
                category: 'Trends',
                title: 'Improving Performance Trend',
                description: analysis.performance_trends.explanation,
                impact: 'low',
                actionable: false
            });
        }

        // Question difficulty insight
        const hardQuestionsRatio = analysis.question_analysis.difficulty_distribution.hard /
            analysis.question_analysis.total_questions;
        if (hardQuestionsRatio > 0.4) {
            insights.push({
                type: 'info',
                category: 'Questions',
                title: 'High Proportion of Difficult Questions',
                description: `${Math.round(hardQuestionsRatio * 100)}% of questions are categorized as hard. ` +
                    `Consider reviewing these questions to ensure they are appropriate for the target audience.`,
                impact: 'medium',
                actionable: true
            });
        }

        // Driver engagement insight
        if (analysis.engagement_metrics.average_days_active_per_driver < 3) {
            insights.push({
                type: 'warning',
                category: 'Engagement',
                title: 'Low Driver Engagement',
                description: `Drivers are active an average of only ${analysis.engagement_metrics.average_days_active_per_driver} days. ` +
                    `Consider implementing engagement strategies to increase participation.`,
                impact: 'high',
                actionable: true
            });
        }

        return insights;
    }

    /**
     * Generate recommendations
     */
    static _generateRecommendations(analysis) {
        const recommendations = [];

        // Performance recommendations
        if (analysis.overview.overall_accuracy < 60) {
            recommendations.push({
                priority: 'high',
                category: 'Performance',
                title: 'Improve Question Difficulty Balance',
                description: 'Consider reviewing and adjusting question difficulty. Add more medium-difficulty questions and provide better explanations.',
                action_items: [
                    'Review hardest questions and consider simplifying or improving explanations',
                    'Add more practice questions for difficult topics',
                    'Provide additional learning resources for low-performing areas'
                ]
            });
        }

        // Engagement recommendations
        if (analysis.overview.completion_rate < 70) {
            recommendations.push({
                priority: 'high',
                category: 'Engagement',
                title: 'Increase Quiz Completion Rates',
                description: 'Implement strategies to encourage drivers to complete quizzes.',
                action_items: [
                    'Reduce quiz length if quizzes are too long',
                    'Add progress indicators and encouragement messages',
                    'Consider gamification elements like streaks and achievements',
                    'Send reminders for incomplete quizzes'
                ]
            });
        }

        // Driver support recommendations
        const bottomPerformers = analysis.driver_analysis.bottom_performers;
        if (bottomPerformers.length > 0 && bottomPerformers[0].average_score < 50) {
            recommendations.push({
                priority: 'medium',
                category: 'Support',
                title: 'Provide Additional Support to Struggling Drivers',
                description: `Several drivers are performing below 50% average score. Consider targeted support.`,
                action_items: [
                    `Reach out to ${bottomPerformers.length} drivers with lowest scores`,
                    'Provide personalized learning paths',
                    'Offer additional practice opportunities',
                    'Schedule review sessions for difficult topics'
                ]
            });
        }

        // Question quality recommendations
        const hardestQuestions = analysis.question_analysis.hardest_questions;
        if (hardestQuestions.length > 0 && hardestQuestions[0].accuracy < 30) {
            recommendations.push({
                priority: 'medium',
                category: 'Questions',
                title: 'Review and Improve Difficult Questions',
                description: 'Some questions have very low accuracy rates, which may indicate unclear wording or incorrect answers.',
                action_items: [
                    `Review ${hardestQuestions.length} questions with accuracy below 30%`,
                    'Check for ambiguous wording or unclear options',
                    'Verify correct answers are accurate',
                    'Consider rewriting or removing problematic questions'
                ]
            });
        }

        // Engagement timing recommendations
        if (analysis.time_analysis.peak_hour) {
            recommendations.push({
                priority: 'low',
                category: 'Timing',
                title: 'Optimize Notification Timing',
                description: `Peak activity occurs at ${analysis.time_analysis.peak_hour.time_period}. Consider timing notifications accordingly.`,
                action_items: [
                    `Schedule push notifications around ${analysis.time_analysis.peak_hour.time_period}`,
                    'Send daily quiz reminders during peak hours',
                    'Analyze if off-peak hours can be improved with better timing'
                ]
            });
        }

        return recommendations;
    }

    // Helper methods
    static _calculateMedian(numbers) {
        if (numbers.length === 0) return 0;
        const sorted = [...numbers].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    static _calculateScoreDistribution(scores) {
        const distribution = {
            excellent: 0, // 90-100
            good: 0, // 70-89
            average: 0, // 50-69
            poor: 0 // 0-49
        };

        scores.forEach(score => {
            if (score >= 90) distribution.excellent++;
            else if (score >= 70) distribution.good++;
            else if (score >= 50) distribution.average++;
            else distribution.poor++;
        });

        return distribution;
    }

    static _categorizePerformance(avgScore, accuracy, completionRate) {
        if (avgScore >= 80 && accuracy >= 75 && completionRate >= 80) {
            return 'excellent';
        } else if (avgScore >= 60 && accuracy >= 60 && completionRate >= 60) {
            return 'good';
        } else if (avgScore >= 40 && accuracy >= 40) {
            return 'average';
        } else {
            return 'needs_improvement';
        }
    }

    static _calculatePerformanceDistribution(drivers) {
        const distribution = {
            excellent: 0,
            good: 0,
            average: 0,
            needs_improvement: 0
        };

        drivers.forEach(driver => {
            distribution[driver.performance_category]++;
        });

        return distribution;
    }

    static _categorizeDifficulty(accuracy) {
        if (accuracy >= 70) return 'easy';
        if (accuracy >= 40) return 'medium';
        return 'hard';
    }

    static _findMostCommonMistake(optionSelections) {
        const entries = Object.entries(optionSelections);
        if (entries.length === 0) return null;
        return entries.sort((a, b) => b[1] - a[1])[0][0];
    }

    static _getTimePeriod(hour) {
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
    }
}

module.exports = AnalysisService;