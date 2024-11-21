import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import FileUpload from './FileUpload';
import FileHistory from './FileHistory';

interface MainTabsProps {
  userId: string;
}

const MainTabs: React.FC<MainTabsProps> = ({ userId }) => {
  return (
    <Tabs isFitted variant="enclosed">
      <TabList mb="1em">
        <Tab>Upload Files</Tab>
        <Tab>My Quizzes</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <FileUpload />
        </TabPanel>
        <TabPanel>
          <FileHistory userId={userId} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default MainTabs; 