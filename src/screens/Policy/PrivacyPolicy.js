import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';

const PrivacyPolicy = () => {
    const handleEmailPress = () => {
        Linking.openURL('mailto:namaste@salarybooks.com');
    };

    const handleLinkPress = (url) => {
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                This Privacy Policy explains how information about you is collected, used and disclosed by <Text style={styles.bold}>Vauras Biztech LLP</Text>, a company incorporated under the Companies Act 2013, doing business as Salarybooks, and its subsidiaries and affiliates (collectively, "<Text style={styles.bold}>Salarybooks</Text>," "<Text style={styles.bold}>we</Text>," "<Text style={styles.bold}>us</Text>" or "<Text style={styles.bold}>our</Text>") when you access or use our website (the "<Text style={styles.bold}>Site</Text>") and our online payroll, benefits, human resources and other related services (the "<Text style={styles.bold}>Service</Text>"), which are provided through the Site. By using the Site and/or the Service, you consent to the collection, use and disclosure of your information as outlined in this Privacy Policy.
            </Text>

            <Text style={styles.heading}>Information We Collect and How We Collect It</Text>
            <Text style={styles.text}>
                In connection with your access to our Site and/or use of our Service, we collect and store certain information about you. Some of this information can be used on its own or in combination with other information to identify you individually. We call that information "personal information." We collect personal information and other information as described below:
            </Text>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Information You Provide:</Text> We collect your personal information when you or your employer registers to use the Service, provides information when using the Site or Service, updates your account information, adds additional services, submits information to verify your identity, contacts us with questions or feedback, or otherwise communicates with us. This personal information may include your name, address, email address, phone number, bank account information and taxpayer identification number.</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>When You Choose to Participate in Market Research Programs:</Text> We may collect information from you, including personal information, if you choose to participate in a market research program or survey.</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Your Email or Social Network Contacts:</Text> We collect your email, social network and other contacts ("<Text style={styles.bold}>Contacts</Text>") if you choose to share them with us, or you choose to refer potential customers to us via our referral programs (the "<Text style={styles.bold}>Referred Leads</Text>").</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Public Information:</Text> We may collect information about you from public sources, such as public social media pages.</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Information from Third Parties:</Text> We may collect and receive information about you, including personal information and financial account information, from third parties, such as financial institutions and our service providers, for identity verification, fraud protection, risk assessment and other purposes. We may collect your business information from credit bureaus for the foregoing purposes as well. In addition, we may receive demographic information about you from third parties to help us better understand our users and to improve and market our Service.</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}>
                    <Text style={styles.bold}>Automatically Collected Information:
                        </Text><Text> We automatically collect certain usage information when you access the Site or use the Service, such as your device identifier (if using a mobile device), Internet Protocol (IP) address (if using a browser), operating system, browser type and the address of a referring site. We also automatically collect certain usage information through cookies and related technologies, as described below. In addition, our Site may implement third-party software, such as Google's Invisible reCAPTCHA (the "<Text style={styles.bold}>Invisible CAPTCHA</Text>"), that collects your information for security purposes.</Text>
                </Text>
            </View>

            <Text style={styles.heading}>Third-Party Software, Cookies and Other Related Technologies</Text>
            <Text style={styles.text}>
                We may use cookies, pixel tags, web beacons and other similar technologies to better understand how you interact with our Site, monitor aggregate usage by our users, and monitor web traffic routing on our Site to help us improve our Site. Most Internet browsers let you change the browser's settings to stop accepting cookies or to prompt you before accepting a cookie from websites you visit. If you do not allow cookies, you may not be able to use some or all portions or functionality of the Site or Service.
            </Text>
            <Text style={styles.text}>
                We partner with third parties to manage our advertising on other sites and to determine our Site performance. Such partners may use cookies, pixel tags, web beacons and other related technologies to collect information about your activities on our Site and other sites so that we can (i) provide advertising that may be of interest to you, and (ii) evaluate the efficacy of our marketing programs and our Site. To prevent our partners from collecting your information for these purposes, you can visit <Text style={styles.link} onPress={() => handleLinkPress('http://preferences-mgr.truste.com')}>http://preferences-mgr.truste.com</Text> to opt out of certain advertising networks.
            </Text>
            <Text style={styles.text}>
                We use the Invisible CAPTCHA on our Site to collect information for security reasons. Use of the Invisible CAPTCHA and information collected via the Invisible CAPTCHA are subject to Google's Terms of Service and Privacy Policy, respectively.
            </Text>

            <Text style={styles.heading}>Use of Your Information</Text>
            <Text style={styles.text}>
                We use personal information to provide the services you request. To the extent we use your personal information to market to you, we will provide you the ability to opt-out of such uses. We use your personal information to resolve disputes; troubleshoot problems; help promote a safe service; collect money; measure consumer interest in our products and services, customize your experience; detect and protect us against error, fraud and other criminal activity; enforce our terms and conditions; and as otherwise described to you at the time of collection.
            </Text>
            <Text style={styles.text}>
                With your consent, we will have access to your SMS, contacts in your directory, call history, location and device information and we may request you to provide your PAN and Aadhaar details to check your eligibility for certain products/services (including but not limited to providing credit) being offered by us, our affiliates or our lending partners. We may share this data with our affiliates or our lending partners for the same purposes as mentioned above, however, we will not store any Aadhaar data ourselves. In the event that consent to such use of data is withdrawn in the future, we will stop collection of such data but continue to store the data (save for Aadhaar data) and use it for internal purposes to further improve our services. We identify and use your IP address to help diagnose problems with our server, and to administer our Website. Your IP address is also used to help identify you and to gather broad demographic information.
            </Text>
            <Text style={styles.text}>Following are the objectives behind our collection and use of your information:</Text>
            <View style={styles.list}>
                {[
                    'to administer the Site, manage accounts and provide the Service;',
                    'to monitor, analyze, improve and develop the Site and Service, and to create new Service features;',
                    'to provide a more customized experience on the Site, Service and/or our partners\' or affiliates\' websites;',
                    'to understand our users better;',
                    'to validate user information provided to us for fraud and risk detection purposes;',
                    'to determine eligibility for the Service;',
                    'to prevent, identify and address fraudulent or other illegal activity and security issues;',
                    'to (i) solicit feedback, (ii) respond to your or your employer\'s comments, requests or inquiries, (iii) provide customer service and support, or (iv) otherwise contact you in connection with the Site or Service;',
                    'to generate anonymized, aggregate data containing only de-identified, non-personal information that we may use to publish reports;',
                    'for our marketing purposes, such as (i) informing you of our products, services, features or offerings that may be of interest to you, (ii) providing you updates and announcements, (iii) contacting Referred Leads and suggesting Contacts for you to refer to Salarybooks, (iv) improving and tailoring our advertising and communications, (v) analyzing our marketing efforts, and (vi) determining your eligibility for certain marketing programs, events and offers;',
                    'to operate our business, which includes, without limitation, using your information (i) to process payments, (ii) to manage and enforce contracts with you or with third parties, (iii) to manage our corporate governance, compliance and auditing practices;',
                    'to (i) comply with laws, rules and regulations, including any disclosure or reporting obligations, (ii) resolve disputes with users or third parties, (iii) respond to claims and legal process (including but not limited to subpoenas and court orders) as we deem necessary or appropriate, (iv) protect our property rights or those of third parties, (v) protect the safety of the public or any person, and (vi) prevent or stop any activity which we may consider to be (or to pose a risk of being) illegal, unethical or legally actionable; and',
                    'for any other purpose for which you expressly authorize us to use your information.'
                ].map((item, index) => (
                    <View key={index} style={styles.listItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.listItemText}>{item}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.heading}>Sharing and Disclosure of Your Information</Text>
            <Text style={styles.text}>We will only share your information with the third parties listed below for the purposes described above in the "Use of Your Information" Section:</Text>
            <View style={styles.list}>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>government agencies and taxing authorities, as required to provide the Service, including but not limited to any person authorized to be in receipt of such information by the Income Tax Act, Employees Provident Fund and Miscellaneous Provisions Act, 1952, Payment of Bonus Act 1965, Payment of Gratuity Act 1972, Factories Act 1948, Maternity Benefit 1961, Industrial Employment Act 1946 or any other law for the time being in force and state and local tax agencies;</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>banking and financial institutions;</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>certain parties as necessary to respond in good faith to legal process (including but not limited to subpoenas and court orders);</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>legal and financial advisors and auditors;</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.listItemText}>third-party agents, partners and service providers, who (i) are only permitted to use your information as we allow (which may include contacting you on our behalf), and (ii) are required under law or contract to keep your personal information confidential; and</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.bullet}>•</Text>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.listItemText}>the following third parties under the circumstances described below:</Text>
                        <View style={styles.nestedList}>
                            <View style={styles.listItem}>
                                <Text style={styles.bullet}>-</Text>
                                <Text style={styles.listItemText}>we may share business information with credit bureaus, and we may share information with certain companies, banks and organizations for the purposes of fraud prevention and determining eligibility for the Service;</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Text style={styles.bullet}>-</Text>
                                <Text style={styles.listItemText}>if you participate in our referral programs and/or share your Contacts with us and invite them to join Salarybooks, the referral emails sent to your Contacts and Referred Leads will include your name, employer's name and the fact that you are a Salarybooks user;</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Text style={styles.bullet}>-</Text>
                                <Text style={styles.listItemText}>if there is a sale of Salarybooks (including, without limitation, a merger, stock acquisition, sale of assets or reorganization), or in the event that Salarybooks liquidates or dissolves, we may sell, transfer or otherwise share some or all of our assets, which could include your information, to the acquirer;</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Text style={styles.bullet}>-</Text>
                                <Text style={styles.listItemText}>from time to time, we may share reports with the public that contain anonymized, aggregate, de-identified information and statistics; and</Text>
                            </View>
                            <View style={styles.listItem}>
                                <Text style={styles.bullet}>-</Text>
                                <Text style={styles.listItemText}>we may share your information with certain other third parties with whom you expressly authorize us to share your information.</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <Text style={styles.heading}>Your Choices</Text>
            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Changing or Deleting Your Information:</Text> You may review, update, correct or delete your personal information through your account or by contacting us using the contact information listed below. If you would like us to delete your account entirely, please contact us at <Text style={styles.link} onPress={handleEmailPress}>namaste@salarybooks.com</Text> with a request that we delete your personal information from our database. Please note that there may be some delay in the deletion of your data from our servers following your request. Additionally, we may retain some of your data as necessary to comply with our legal obligations, resolve disputes, enforce our agreements, or as needed for other legitimate business purposes.</Text>
            </View>
            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Promotional Communications:</Text> You may unsubscribe from marketing and promotional emails that we send to you by following the opt-out instructions contained in such emails or by unsubscribing at <Text style={styles.link} onPress={handleEmailPress}>namaste@salarybooks.com</Text>. If you opt out of receiving marketing and promotional emails from us, we may still need to send you emails related to your account and the Service.</Text>
            </View>

            <View style={styles.highlightSection}>
                <Text style={styles.text}><Text style={styles.bold}>Do Not Track:</Text> Our Site does not currently have the capability of responding to "Do Not Track" signals received from various browsers.</Text>
            </View>

            <Text style={styles.heading}>Security</Text>
            <Text style={styles.text}>
                Our Website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access. We employ administrative, physical and technical measures designed to protect your information from unauthorized access and to comply with all applicable regulations under the Information Technology Act 2000, IT Amendment Act 2006 and IT Amendment Act 2008 and under any other law for the time being in force; however, despite these efforts, no security measures are perfect or impenetrable and no method of data transmission can be guaranteed to prevent any interception or other type of misuse. We also depend on you to protect your information. Please set up a strong password and keep it confidential. If you become aware of any breach of security, please notify us immediately.
            </Text>

            <Text style={styles.heading}>Links to Other Sites</Text>
            <Text style={[styles.text, { marginBottom: 30 }]}>
                The Site and/or Service may contain links to other sites. Any information you provide on a third-party site is provided directly to the owner of that site and is subject to that party's privacy policy. This Privacy Policy does not apply to such sites, and we are not responsible for the content, policies, or privacy and security practices of such sites.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
        marginBottom: 10,
        fontFamily: 'Outfit-bold',
    },
    text: {
        fontSize: 13,
        lineHeight: 20,
        color: '#fff',
        marginBottom: 10,
        fontFamily: 'Outfit-bold',
    },
    bold: {
        fontWeight: 'bold',
    },
    link: {
        color: '#7D99FF',
        textDecorationLine: 'underline',
    },
    highlightSection: {
        marginBottom: 15,
    },
    list: {
        marginVertical: 10,
    },
    nestedList: {
        marginLeft: 15,
        marginTop: 5,
    },
    listItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        color: '#fff',
        width: 15,
        fontSize: 14,
    },
    listItemText: {
        flex: 1,
        color: '#fff',
        fontSize: 13,
        lineHeight: 18,
    }
});

export default PrivacyPolicy;
